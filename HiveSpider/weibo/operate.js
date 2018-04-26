const puppeteer = require('puppeteer');
const Http = require("./api/http").Http;
const getApi = require("./api/fetch").getApi;
const File = require("fs");

let pages = [void 0, void 0];

const bigBrickId = 14099;
const smallBrickId = "";

const BEE_NAME = "weibo_operate"

let user = {
    username: "15351702865",
    password: "cqcp815"
}

const getRequire = async () => {

    let moreArgs = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify({
            "start_time":1524654944207,
            "end_time":1554654944207
        })
    }

    let result = await getApi("http://chatbot.api.talkmoment.com/topic/lego/hot/get/by/time", moreArgs);
    result = result.result
    return result;

}
const postWashTask = async (brick_id, data) => {
    let washTask = {
        name: "wash_corpus",
        value: "",
        config: JSON.stringify({
            bee_source: BEE_NAME,
            brick_id: brick_id,
            publish: true
        }),
        data: JSON.stringify(data),
        scheduled_at: Date.now()
    };
    await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
};
const postDataToMessage = async (data) => {
    await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=` + BEE_NAME, data);
};

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const log = (str) => {
    let date = new Date();
    console.log(str + ">>>>>" + date);
};

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
};
//登陆
const openIndex = async (user) => {
    log("开始登陆");
    try{
        await pages[0].waitForFunction("document.querySelector('title').innerHTML.indexOf('我的首页')>=0");
        log("登录成功");
        process.send({
            type: "login"
        })
        return;
    }catch (e){

    }

    try {
        await pages[0].waitForSelector("input[name=username]");
    } catch (e) {
        console.log("打开主页失败，正在重试");
        await pages[0].reload();
        await sleep();
        await openIndex(user);
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
};

const searchBigVName = async () => {

    let currentUrl = "https://weibo.com/songjia?profile_ftype=1&is_all=1";
    let page = 1;

    const main = async (curPage) => {

        let requireWeibo = await getRequire()
        console.log("获取requireWeibo", requireWeibo)
        curPage.goto(currentUrl);
        try {
            await curPage.waitForSelector("div.WB_frame_c", {timeout: 60000});
            console.log("博主页面进入成功");
        } catch (e) {
            console.log("博主页面加载失败，正在重试");
            await curPage.reload();
            await sleep();
            main(curPage);
            return;
        }
        log("进入博主 " + await curPage.title());

        await sleep(1);

        currentUrl = curPage.url();

        //展现全部页面
        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 80);
                if (document.querySelector("[node-type=feed_list_page]")) {
                    clearInterval(interval);
                }
            }, 50)
        });
        try {
            await pages[0].waitForSelector("[node-type=feed_list_page]", {timeout: 60000});
            console.log("加载底部翻页按钮成功");
        } catch (e) {
            console.log("加载底部翻页按钮失败，正在重试");
            await pages[0].reload();
            await sleep(60);
            await main(curPage);
            return;
        }

        await sleep(5);

        console.log("博主页面加载完毕");
        let datesButton = await curPage.$$(".WB_func [node-type=feed_list_item_date][date]");
        let datesButtonDom = await curPage.evaluate(() => {
            let result = [];
            let datesButton = document.querySelectorAll(".WB_func [node-type=feed_list_item_date][date]");
            for(let datesB of datesButton){
                let dd = {
                    date: new Date(datesB.getAttribute("title")).getTime(),
                    href: datesB.getAttribute("href")
                }
                result.push(dd);
            }
            return result;
        })

        let qwe = (url) => {
            console.log(url)
            for(let i=0;i< requireWeibo.length;i++){
                if(requireWeibo[i].href.indexOf(url) > -1){
                    return requireWeibo[i];
                }
            }
            return false;
        }

        //遍历本页所有转发
        for(let i =0;i< datesButton.length;i++){
            let url = datesButtonDom[i].href;
            let time = datesButtonDom[i].date;
            let qwee = qwe(url);
            let lego_id = qwee.lego_id;
            if(lego_id) continue;
            if(!(qwee.start_time <= time) || !(time <= qwee.end_time)) continue;


            await datesButton[i].click();
            let Pages = await browser.pages();
            while(Pages.length === 2){
                await sleep(2);
                Pages = await browser.pages();
            }
            pages[1] = Pages[2];
            let ainResult = await ain(pages[1]);
            console.log(ainResult.length, '返回了ainResult', i);

            for(let re of ainResult){
                re.brick_id = smallBrickId;
                re.lego_id = lego_id;
                await postDataToMessage(re);
                await postWashTask(smallBrickId, re);
            }
        }

        //进入下一页
        try{
            await curPage.waitForSelector(".page.next.S_txt1.S_line1", {timeout: 60000});
            page += 1;
            currentUrl = currentUrl + "&page=" + page;
            await main(curPage);
        }catch(e){
            console.log("一次遍历完成")
        }

    };

    let ain = async (curPage) => {
        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 200);
                if (document.querySelector("[action-type=click_more_comment] .more_txt]")) {
                    clearInterval(interval);
                }
            }, 500)
        });
        await sleep();

        let commentCount = 0;

        while(commentCount < 100){
            commentCount = await curPage.$$("[node-type=root_comment]");
            commentCount = commentCount.length;
            try{
                const loadMoreButton = await curPage.$("[action-type=click_more_comment] .more_txt");
                await loadMoreButton.click();
            }catch(e){
            }
        }
        console.log("页面显示完全");
        console.log("获取评论数目: ", commentCount);

        await sleep(2);

        let result = await curPage.evaluate(() => {

            //解析所有表情
            var imgs = document.querySelectorAll("img");
            for(let i =0 ; i< imgs.length ;i++){
                let title = imgs[i].getAttribute("title");
                let alt = imgs[i].getAttribute("alt");
                if(title && alt && title === alt){
                    imgs[i].outerHTML = title;
                }

            }

            let commentsTemplate = [];
            let comments = document.querySelectorAll("[node-type=root_comment]");
            for(let i=0;i< comments.length;i++){

                let comment = {
                    commenterInfo: {
                        agree: 0,
                        text: "",
                        faceImg: "",
                        name: "",
                        homePage: "",
                        withImg: "",
                        created_at: ""
                    },
                    reply: []
                }

                let info = comments[i].querySelector(".WB_face");
                if(info.querySelector("a")){
                    comment.commenterInfo.homePage = info.querySelector("a").getAttribute("href");
                    comment.commenterInfo.faceImg = info.querySelector("a img").getAttribute("src");
                    comment.commenterInfo.name = info.querySelector("a img").getAttribute("alt");
                }
                comment.commenterInfo.text = comments[i].querySelector(".WB_text").innerText;
                comment.commenterInfo.agree = parseInt(comments[i].querySelectorAll(".WB_func [node-type=like_status] em")[1].innerText);
                if(!comment.commenterInfo.agree){
                    comment.commenterInfo.agree = 0;
                }

                if(comments[i].querySelector(".media_box")){
                    comment.commenterInfo.withImg = comments[i].querySelector(".media_box img").getAttribute("src");
                }
                comment.commenterInfo.created_at = new Date(comments[i].querySelector(".WB_func .WB_from").innerText).getTime();

                if(!comment.commenterInfo.created_at){
                    comment.commenterInfo.created_at = comments[i].querySelector(".WB_func .WB_from").innerText;
                    comment.commenterInfo.created_at = "2018-" + comment.commenterInfo.created_at;
                    comment.commenterInfo.created_at = comment.commenterInfo.created_at.replace("月", "-")
                    comment.commenterInfo.created_at = comment.commenterInfo.created_at.replace("日", "-")

                    comment.commenterInfo.created_at = new Date(comment.commenterInfo.created_at).getTime();
                }

                let reply = comments[i].querySelectorAll("[node-type=child_comment] .list_li.S_line1");
                for(let re of reply){
                    if(re.querySelector(".WB_text").innerText.indexOf("条回复") == -1){
                        let reJ = {
                            text: re.querySelector(".WB_text").innerText,
                            created_at: 0,
                            agree: 0
                        }
                        if(re.querySelector(".WB_func .WB_from")){
                            let str = re.querySelector(".WB_func .WB_from").innerText;
                            str = new Date(str).getTime()
                            if(!str){
                                str = re.querySelector(".WB_func .WB_from").innerText;
                                str = "2018-" + str;
                                str = str.replace("月", "-")
                                str = str.replace("日", "-")

                                str = new Date(str).getTime()
                            }
                            reJ.created_at = str;
                        }
                        if(re.querySelectorAll(".WB_func .like_status em") && re.querySelectorAll(".WB_func [node-type=like_status] em")[1]){
                            reJ.agree = parseInt(re.querySelectorAll(".WB_func [node-type=like_status] em")[1].innerText);
                        }
                        if(!reJ.agree){
                            reJ.agree = 0;
                        }

                        comment.reply.push(reJ);
                    }
                }
                console.log(comment);
                commentsTemplate.push(comment);
            }
            return commentsTemplate;

        })

        await curPage.close();

        return result;
    }

    await main(pages[0])
}

let run = async () => {
    await launchBrowser();
    //await openIndex(user);
    while(true){
        await searchBigVName();
        await sleep(60);
    }
}
run();