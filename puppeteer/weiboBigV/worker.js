const puppeteer = require('puppeteer');
const File = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");
//add
//navigation Timeout 事件捕获
const log = (str) => {
    let date = new Date();
    console.log(str + ">>>>>" + date);
};
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const rmAnnotation = (str) => {
    if (str) {
        return str.replace(/<!--(.|\s)*?-->/g, "");
    } else {
        return str;
    }
};

let errTime = 0;
let bottomErrTime = 0;
let pages = [void 0, void 0];
let browser;
let blogName = "";

//调度机
process.on("message", async function (e) {
    console.log("收到爸爸的指导", e);
    switch (e.type) {
        case "user": {
            await openIndex(e.user);
            break;
        }
        case "task": {
            blogName = e.url;
            await searchBlogName();
            break;
        }
    }
})
//需要worker
//启动puppeteer
const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        timeout: 0,
        devtools: false
    });
    log("启动浏览器成功");

    pages[0] = await browser.newPage();
    await pages[0].setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko)" +
        " Chrome/62.0.3202.75 Safari/537.36");
    await pages[0].setViewport({
        width: 1920,
        height: 1080,
        isLandscape: true
    });
    log("打开微博首页");
    try {
        await pages[0].goto('https://www.weibo.com');
    } catch (e) {
        console.log("打开微博首页失败，正在重试");
        await pages[0].reload();
        await sleep();
        return;

    }
    console.log("已启动");
    process.send({
        type: "launched"
    })
};

//登陆
const openIndex = async (user) => {
    log("开始登陆");
    try {
        await pages[0].waitForSelector("input[name=username]");
    } catch (e) {
        console.log("打开主页失败，正在重试");
        await pages[0].reload();
        await sleep();
        openIndex(pages[0]);
        return;
    }
    const userName = await pages[0].$("input[name=username]");
    await userName.click();
    try {
        await pages[0].waitForSelector("input[name=username]");
    } catch (e) {
        console.log("聚焦用户名输入框失败，正在重试");
        await pages[0].reload();
        await sleep();
        await openIndex(user);
        return;
    }
    await sleep(3);
    await userName.click();
    await sleep(3);
    let userNameStr = user.username;
    await userName.type(userNameStr);
    const password = await pages[0].$("input[name=password]");
    await password.click();
    let passwordStr = user.password;
    await password.type(passwordStr, {delay: 50});
    const login = await pages[0].$("a[node-type=submitBtn]");
    await login.click();
    log("正在登录");
    try {
        await pages[0].waitForFunction("document.querySelector('title').innerHTML.indexOf('我的首页')>=0");
    } catch (e) {
        console.log("登录失败，正在重试");
        await pages[0].reload();
        await sleep();
        await openIndex(user);
        return;
    }
    log("登录成功");
    process.send({
        type: "login"
    })
};

//进入搜索的人的主页 修改
const searchBlogName = async () => {
    try {
        await pages[0].goto(`http://s.weibo.com/user/${encodeURIComponent(blogName)}&Refer=focus_lx_STopic_box`);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        console.log(e);
        await sleep();
        await searchBlogName();
        return;
    }

    try {
        await pages[0].waitForSelector("p.person_name a");
    } catch (e) {

    }

    log("搜索对应微博账号");
    await sleep();

    const name = await pages[0].$("p.person_name a");
    await name.click();
    let curPage;
    let check = async () => {
        let newPages = await browser.pages();
        if (newPages.length === 2) {
            await sleep(0.1);
            check();
        } else {
            curPage = newPages[2];
            await newPages[1].close();
            pages[0] = curPage;
            main(curPage, browser);
        }
    };
    check();
};
//解析
const parseDom = async (html) => {
    html += "";
    let d = new jsdom.JSDOM(html);
    let $ = jq(d.window);
    let wbList = $("div[action-type=feed_list_item]:not([isforward='1'])");
    let saveStr = "";
    for (let wb of wbList) {
        let $$ = $(wb);
        let blogId = $$.attr("mid");
        let infoHTML = $$.find(".WB_feed_detail .WB_from").html().trim();
        let contentHTML = $$.find(".WB_feed_detail .WB_text").html().trim();
        let mediaHTML = rmAnnotation($$.find(".WB_feed_detail .WB_media_wrap").html());
        let commentsHTML = rmAnnotation($$.find("div.list_box").html());
        let obj = {
            blogId: blogId,
            blogName: blogName,
            infoHTML: infoHTML,
            contentHTML: contentHTML,
            mediaHTML: mediaHTML,
            commentsHTML: commentsHTML,
            created_at: Date.now()
        };
        saveStr += JSON.stringify(obj) + "\n";
    }
    let date = new Date();
    let dateStr = "" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    File.appendFileSync("./data/" + dateStr + ".txt", saveStr);
};

//进入原创页面 加载玩所有微博并点开前15个评论 修改
const main = async (curPage, browser) => {
    try {
        await curPage.waitForSelector("div.WB_frame_c");
    } catch (e) {
        console.log("博主页面加载失败，正在重试");
        bottomErrTime++;
        if(bottomErrTime === 5){
            process.send({
                type: "error",
                url: blogName
            })
            return ;
        }
        await curPage.reload();
        await sleep();
        main(curPage, browser);
        return;
    }
    log("进入博主 " + await curPage.title());
    bottomErrTime = 0;

    await sleep(1);

    let currentUrl = await curPage.evaluate(() => {
        return window.location.href;
    });

    if (currentUrl.indexOf("is_ori=1") < 0) {
        currentUrl = currentUrl.substr(0, currentUrl.indexOf("?") + 1);
        currentUrl += "is_ori=1";
        try {
            await curPage.goto(currentUrl);
        } catch (e) {

        }
        await sleep();
        main(curPage, browser);
        return;
    }

    await curPage.evaluate(() => {
        let interval = setInterval(function () {
            //这里增加了翻页速度 50 -> 100
            window.scrollTo(0, document.documentElement.scrollTop + 100);
            if (document.querySelector("div.W_pages a[bpfilter=page]")) {
                clearInterval(interval);
            }
        }, 50)
    });
    try {
        await curPage.waitForSelector("div.W_pages a[bpfilter=page]", {timeout: 30000});
    } catch (e) {
        console.log("加载底部翻页按钮失败，正在重试");
        await curPage.reload();
        await sleep(60);
        main(curPage, browser);
        return;
    }
    log("已滚动到页面底部");

    let blogNodes = await curPage.$$("div[action-type=feed_list_item]:not([isforward='1'])");
    let count = 0;
    //添加 i<15 原来全点了 太耗时间了 而且还真有智障两天发超过15条微博的 一天发15条应该不至于
    for (let i = 0; i < blogNodes.length && i < 15; i++) {
        let item = blogNodes[i];
        let commentBtn = await item.$("a[action-type=fl_comment]");
        await commentBtn.click();
        //log("点开评论" + ++count);
        try {
            await curPage.waitForFunction("document." +
                "querySelectorAll(\"div.WB_feed_like p.text" +
                " i.W_loading:not([style='display:none;'])\").length" +
                " == 0"
                , {timeout: 10000});
        } catch (e) {
            await sleep();
            let ok = await curPage.$("a[node-type=ok]");
            if (ok) {
                await ok.click();
            }
            await sleep(2);
            await commentBtn.click();
            log("评论" + count + "加载失败，正在重试");
            if (errTime === 10) {
                log("出错超过十次！");
                process.send({
                    type: "error",
                    url: blogName
                })
                return;
            }
            errTime++;
            i--;
            count--;
            continue;
        }
        errTime = 0;
        //log("评论" + count + "加载完毕");
        await sleep(1);
    }

    let htmlStr = await curPage.$eval('div.WB_frame_c', e => e.outerHTML);

    await parseDom(htmlStr);

    console.log(`已完成 ${await curPage.title()} 的爬取,进入下一个博主！`);
    process.send({
        type: "success",
        url: blogName
    })
};

launchBrowser();
