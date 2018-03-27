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

let task;

//调度机
process.on("message", async function (e) {
    console.log("收到爸爸的指导", e);
    task  = e;
    switch (e.name) {
        case "user": {
            await openIndex(e.user);
            break;
        }
        case "weibo_keyword": {
            console.log("puppeteer收到关键词任务");
            await searchKeyword();
            break;
        }
        case "weibo_bigv": {
            console.log("puppeteer收到微博大v任务");
            await searchBigVName();
            break;
        }
        case "weibo_update_everyday": {
            console.log("puppeteer收到微博首页更新任务");
            await updateEveryDay();
            break;
        }
    }
})
//需要worker

//启动puppeteer
const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        timeout: 0,
        devtools: false
    });
    log("启动浏览器成功");

    pages[0] = await browser.newPage();
    await pages[0].setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko)" +
        " Chrome/62.0.3202.75 Safari/537.36");
    await pages[0].setViewport({
        width: 1360,
        height: 765,
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

//关键词搜索
const searchKeyword = async () => {
    try {
        await pages[0].goto(`http://s.weibo.com/weibo/${encodeURIComponent(task.value)}&Refer=index`);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        console.log(e);
        await sleep();
        await searchKeyword();
        return;
    }

    let noresult = await pages[0].evaluate(() => {
        if(document.querySelector(".search_noresult")) return true;
        return false;
    })

    if(noresult){
        task.type = "error";
        process.send(task);
        return;
    }

    //向下滚动
    await pages[0].evaluate(() => {
        let interval = setInterval(function () {
            //这里增加了翻页速度 50 -> 100
            window.scrollTo(0, document.documentElement.scrollTop + 50);
            if (document.querySelector(".page.next.S_txt1.S_line1")) {
                clearInterval(interval);
            }
        }, 50)
    });

    //
    try {
        await pages[0].waitForSelector(".page.next.S_txt1.S_line1", {timeout: 30000});
        console.log("加载底部翻页按钮成功");
    } catch (e) {
        console.log("加载底部翻页按钮失败，正在重试");
        await pages[0].reload();
        await sleep(60);
        await searchKeyword();
        return;
    }

    let blogNodes = await pages[0].$$("div[action-type=feed_list_item]:not([isforward='1'])")

    let count = 0;
    for (let i = 0; i < blogNodes.length; i++) {
        let item = blogNodes[i];
        let commentBtn = await item.$("[action-type=feed_list_comment]");
        await commentBtn.click();
        log("点开评论" + ++count);
        try {
            await pages[0].waitForFunction("document." +
                "querySelectorAll(\"div.WB_feed_like p.text" +
                " i.W_loading:not([style='display:none;'])\").length" +
                " == 0"
                , {timeout: 10000});
        } catch (e) {
            await sleep();
            let ok = await pages[0].$("a[node-type=ok]");
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
                    name: name,
                    value: keyword,
                    taskId: taskId,
                })
                return;
            }
            errTime++;
            i--;
            count--;
            continue;
        }
        errTime = 0;
        log("评论" + count + "加载完毕");
        await sleep(1);
    }


    //点开所有点开全文 并删除点开全文/收起全文按钮
    for(let i = 0;i< blogNodes.length;i++){
        let openButton = blogNodes[i];
        try{
            let button = await openButton.$$(".WB_text_opt");
            if(button && button[0]) {
                button = button[0]
                await button.click()
            };
            button = await openButton.$$(".WB_text_opt");
            if(button && button[0]) {
                button = button[0]
                await button.click()
            };
        }catch(e){
            console.log(e);
        }
    }

    await pages[0].evaluate(() => {
        let buttons = document.querySelectorAll(".WB_text_opt");
        for(let button of buttons){
            button.remove();
        }
    })

    //收集信息
    let pageResult = await pages[0].evaluate(() => {
        var blogNodes = document.querySelectorAll("div[action-type=feed_list_item]:not([isforward='1'])");
        var result = []
        for(var blogNode of blogNodes){
            var TemplateData = {
                title: "",
                content: "",
                transmieCount: 0,
                commentCount: 0,
                agreeCount: 0,
                created_at: 0,
                comments: [],
                imgs: [],
                video: {
                    src: "",
                    cover_img: {
                        url: "",
                        width: 0,
                        height: 0
                    }
                },
                detailUrl: ""
            }
            let existAndReturn = (str) => {
                if(blogNode.querySelector(str)){
                    return parseInt(blogNode.querySelector(str).innerText.trim())
                }else{
                    return 0;
                }
            }
            TemplateData.transmieCount = existAndReturn("[action-type=feed_list_forward] .line.S_line1 em");
            TemplateData.commentCount = existAndReturn("[action-type=feed_list_comment] .line.S_line1 em");
            TemplateData.agreeCount = existAndReturn("[action-type=feed_list_like] .line.S_line1 em");

            try{
                let created_at = new Date(blogNode.querySelector(".feed_list_item_date em").innerText);
                if(created_at == "Invalid Date"){
                    throw new Error("时间格式不对");
                }else{
                    TemplateData.created_at = created_at.getTime();
                }
            }catch(e){
                let created_at = new Date().getTime();
            }

            if(blogNode.querySelector(".comment_txt[node-type=feed_list_content_full]")){
                TemplateData.content = blogNode.querySelector(".comment_txt[node-type=feed_list_content_full]").innerText;
            }else if(blogNode.querySelector(".comment_txt[node-type=feed_list_content]")){
                TemplateData.content = blogNode.querySelector(".comment_txt[node-type=feed_list_content]").innerText;
            }
            TemplateData.title =  blogNode.querySelector(".feed_content.wbcon .W_texta.W_fb").getAttribute("title");
            TemplateData.detailUrl = blogNode.querySelector(".W_textb [node-type=feed_list_item_date]").getAttribute("href");

            //comment
            var comments = blogNode.querySelectorAll("[node-type=feed_list_commentList] dl .WB_text a");
            for(var comment of comments){
                TemplateData.comments.push(comment.innerText);
            }
            //img
            var imgs= blogNode.querySelectorAll(".WB_pic.S_bg2.bigcursor img");
            for(var img of imgs){
                var tempImg = {
                    url: "",
                    width: 0,
                    height: 0
                };
                tempImg.url = img.getAttribute("src");
                tempImg.width = img.naturalWidth;
                tempImg.height = img.naturalHeight;
                TemplateData.imgs.push(tempImg)
            }

            //video
            if(blogNode.querySelector(".media_box_video_1")){
                var video = blogNode.querySelector(".media_box_video_1");
                TemplateData.video.cover_img.url = video.querySelector(".con-1.hv-pos img").getAttribute("src");
                TemplateData.video.cover_img.width = video.querySelector(".con-1.hv-pos img").naturalWidth;
                TemplateData.video.cover_img.height = video.querySelector(".con-1.hv-pos img").naturalHeight;
                TemplateData.video.src = video.querySelector("video").getAttribute("src");
            }

            result.push(TemplateData);
        }

        return result;
    })

    task.type = "success";
    task.datas = pageResult;
    console.log(task, "task");
    process.send(task);
}

//大v历史搜索
const searchBigVName = async () => {

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
        let dateStr = "dingding" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
        File.appendFileSync(dateStr + ".txt", saveStr);
    };
    const main = async (curPage) => {
        curPage.goto(currentUrl);
        try {
            await curPage.waitForSelector("div.WB_frame_c");
        } catch (e) {
            console.log("博主页面加载失败，正在重试");
            await curPage.reload();
            await sleep();
            main(curPage);
            return;
        }
        log("进入博主 " + await curPage.title());

        await sleep(1);

        currentUrl = await curPage.evaluate(() => {
            return window.location.href;
        });

        if (currentUrl.indexOf("is_ori=1") < 0) {
            console.log(currentUrl);
            console.log("此页非原创页面");
            currentUrl = currentUrl.substr(0, currentUrl.indexOf("?") + 1);
            currentUrl += "is_ori=1";
            console.log(currentUrl);
            try {
                await curPage.goto(currentUrl);
            } catch (e) {

            }
            console.log(currentUrl);
            await sleep();
            main(curPage);
            return;
        }

        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 50);
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
            main(curPage);
            return;
        }
        log("已滚动到页面底部");

        let blogNodes = await curPage.$$("div[action-type=feed_list_item]");
        let count = 0;
        for (let i = 0; i < blogNodes.length; i++) {
            let item = blogNodes[i];
            let commentBtn = await item.$("a[action-type=fl_comment]");
            await commentBtn.click();
            log("点开评论" + ++count);
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
                if (errTime === 20) {
                    log("出错超过20次！");
                    process.exit(0);
                    return;
                }
                errTime++;
                i--;
                count--;
                continue;
            }
            errTime = 0;
            log("评论" + count + "加载完毕");
            await sleep(1);
        }

        let htmlStr = await curPage.$eval('div.WB_frame_c', e => e.outerHTML);

        await parseDom(htmlStr);

        console.log(`已完成 ${await curPage.title()} 的爬取,进入下一个博主！`);

        let nextPage =await curPage.waitForSelector("div.W_pages a[bpfilter=page].next", {timeout: 30000});
        await nextPage.click();

        let check = async () => {
            let pages = await browser.pages();
            if (pages.length === 2) {
                await sleep(0.1);
                check();
            } else {
                curPage = pages[2];
                await pages[1].close();
                main(curPage);
            }
        };
        check();
        currentPage += 1;
        currentUrl = currentUrl.split("?")[0] + "?is_ori=1&page=" + currentPage;
        console.log(currentUrl);
        await main(curPage);
    };

    try {
        await page.goto(`http://s.weibo.com/user/${encodeURIComponent(blogName)}&Refer=focus_lx_STopic_box`);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        await sleep();
        readLocalStorage(page);
        return;
    }

    try {
        await page.waitForSelector("p.person_name a");
    } catch (e) {

    }

    log("搜索对应微博账号");
    await sleep();

    const name = await page.$("p.person_name a");
    await name.click();
    let curPage;
    let check = async () => {
        let pages = await browser.pages();
        if (pages.length === 2) {
            await sleep(0.1);
            check();
        } else {
            curPage = pages[2];
            await pages[1].close();
            main(curPage);
        }
    };
    check();
}

const updateEveryDay = async () => {

}

launchBrowser();