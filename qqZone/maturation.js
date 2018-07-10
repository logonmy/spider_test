// 1634129053---- cqcp815 大号
//todo 封号暂停并提示
//todo 分数获取
const puppeteer = require('puppeteer');
const getApi = require("../nodePart/api/fetch").getApi;

const RedisClient = require("../nodePart/api/redis").RedisClient;
const redis = new RedisClient({host: "127.0.0.1", port: 6379});

const config = {
    firstTimeScore_b: 2,
    firstTimeScore_s: 1,
    intervalScore_b: 2,
    intervalScore_s: 1,
    agreeCommentScore_b: 2,
    agreeCommentScore_s: 1,

    addFriendRequire: 20,
    agreeRequire: 200,
    commentRequire: 20,
    applyRequire: 50,

    addFriendBlock: 20,
    applyBlock: 5,
    commentBackBlock: 20,
    agreeBlock: 2,

    taskName: "qqZoneTask",
    alreadyName: "qqZoneAlready",

    commentEnd: false,
    addFriendEnd: false,
    applyEnd: false,
    agreeEnd: false
}
let logData = {
    chongfuCount: 0,
    debugCount: 0,
    permissionCount: 0,
    addFriendCount: 0,
    dianzanCount: 0,
    commentCount: 0,
}

let pages = [void 0, void 0, void 0, void 0, void 0, void 0];
let browser;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}
const popSet = async (key) => {
    try {
        await redis.connect();
        let re = await redis.srandmember(key, 1);
        await redis.srem(key, re[0]);
        await redis.end();
        return re[0];
    } catch (e) {
        console.log(e);
        console.log("popSeta出错");
    }
}

const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        timeout: 0,
    });
    console.log("启动浏览器成功");

    pages[0] = await browser.newPage();
    await pages[0].setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko)" +
        " Chrome/62.0.3202.75 Safari/537.36");
    await pages[0].setViewport({
        width: 1360,
        height: 765,
        isLandscape: true
    });
    console.log("打开登陆首页");
    await pages[0].goto('https://i.qq.com/', "domcontentloaded");
    console.log("已启动");
};
const login = async (username, password) => {
    console.log("开始登陆");

    console.log("切换登陆方式");

    //let switchButton = await pages[0].$("#switcher_plogin");
    let loginFrame = pages[0].mainFrame().childFrames()[0];
    let switchButton = await loginFrame.$("#switcher_plogin");
    await switchButton.click();


    let nameInput = await loginFrame.$(".inputstyle[type=text]");
    await nameInput.click();
    await nameInput.type(username);

    let passwordInput = await loginFrame.$(".inputstyle[type=password]");
    await passwordInput.click();
    await passwordInput.type(password);

    let submitButton = await loginFrame.$("input[type=submit]");
    await submitButton.click()

    let check = async () => {
        let Pages = await browser.pages();
        if (Pages[1].url().indexOf("i.qq.com") > -1) {
            await sleep(1);
            await check();
        } else {
            pages[0] = Pages[1];

        }
    };

    await check();
    console.log("#######################")
}

let startOut = async () => {
    let url = await popSet(config.taskName);
    await onePage(pages[0], url);
    console.log("==========  finish ONE  ==========");
    console.log(logData, "以上为至今的成果");
    await sleep(1);
    if (config.commentEnd && config.addFriendEnd && config.applyEnd && config.agreeEnd) {
        return;
    }
    await startOut();
}

const addFriend = (() => {
    let lastTime = 0;
    return async (page) => {
        if (config.addFriendEnd || logData.addFriendCount > config.addFriendRequire) {
            config.addFriendEnd = true;
            return;
        }
        if (Date.now() - config.addFriendBlock * 60 * 1000 < lastTime) {
            console.log("添加好友频率限制 现在还不能访问");
            return true;
        }
        lastTime = Date.now();
        try {
            let addButton = await page.$("#add_friend");
            await addButton.click();
            await sleep(1);
            let confirmButton = await page.$(".txt");
            await confirmButton.click();
            console.log("已经添加好友了了", ++logData.addFriendCount, "人");
        } catch (e) {
            console.log(e);
            console.log("点赞出错");
        }
    }
})()


const askPermission = (() => {
    let lastTime = 0;
    return async (page) => {
        if (config.applyEnd || logData.permissionCount > config.applyRequire) {
            config.applyEnd = true;
            return;
        }
        if (Date.now() - config.applyBlock * 60 * 1000 < lastTime) {
            console.log("申请访问频率限制 现在还不能访问");
            return true;
        }
        lastTime = Date.now();
        try {
            let requestButton = await page.$("[data-cmd=apply_request]");
            await requestButton.click();
            await sleep(1);
            let textArea = await page.$("#msg-area");
            await textArea.click();
            await textArea.type("麻烦同意一下喽", {delay: 100});
            let confirmButton = await page.$(".qz_dialog_layer_btn.qz_dialog_layer_sub");
            await confirmButton.click();
            console.log("已经申请访问了", ++logData.permissionCount, "人");
        } catch (e) {
            console.log(e)
            console.log("申请访问出错");
        }
    }
})();
const commentBack = (() => {
    let lastTime = 0;
    const askText = async (str) => {
        str = encodeURIComponent(str);
        let url = "http://chatbot.api.talkmoment.com/image/battle/battle/by/text?text=" + str + "&uid=0&limit=10";
        let re = await getApi(url);
        for (let r of re.result) {
            if (JSON.parse(r.R).src.indexOf("jpg") >= 0) {
                return JSON.parse(r.R).text;
            }
        }
    }
    return async (page) => {
        if (config.commentEnd || logData.commentCount > config.commentRequire) {
            config.commentEnd = true;
            return;
        }

        if (Date.now() - config.commentBackBlock * 60 * 1000 < lastTime) {
            console.log("评论频率限制 现在还不能回复");
            return true;
        }
        lastTime = Date.now();
        try {
            let contentFrame = page.mainFrame().childFrames()[0];
            let rawText = await contentFrame.$$eval(".f-info", nodes => nodes.map(n => n.innerText));
            let text = await askText(rawText);
            let input = await contentFrame.$(".textinput.textinput-default a");
            await input.click();
            await sleep(1);
            await input.type(text, {delay: 100});
            await sleep(1);
            let sendButton = await contentFrame.$(".btn-post.gb_bt.evt_click");
            await sendButton.click();
            await sleep(1);
            console.log("已经回复回去了", ++logData.commentCount, "人");
        } catch (e) {
            console.log(e);
            console.log("评论出错");
        }
    }
})()
const agreeTalkTalk = (() => {
    let lastTime = 0;
    return async (page) => {
        if (config.agreeEnd || logData.dianzanCount > config.agreeRequire) {
            config.agreeEnd = true;
            return;
        }
        if (Date.now() - config.agreeBlock * 60 * 1000 < lastTime) {
            console.log("点赞频率限制 现在还不能回复");
            return true;
        }
        lastTime = Date.now();
        try {
            let contentFrame = page.mainFrame().childFrames()[0];
            let agreeButton = await contentFrame.$(".fui-icon.icon-op-praise");
            await agreeButton.click();
            console.log("已经点过赞了", ++logData.dianzanCount, "人");
        } catch (e) {
            console.log(e);
            console.log("点赞出错了");
        }
    }
})()
const expandUrl = async (page) => {
    let contentFrame = page.mainFrame().childFrames()[0];
    let b = await contentFrame.$$eval(".q_namecard", nodes => nodes.map(n => n.getAttribute("href")));
    await redis.connect();
    for (let a of b) {
        a && await redis.sadd("qqZoneTask", a) && logData.chongfuCount++;
    }
    console.log("目前重复已达", logData.chongfuCount);
    await redis.end();

}
const grade = async (page) => {
    let score = 0;
    try {
        if (Math.random() > 0.8) {
            score = 5
        }
    } catch (e) {

    }
    console.log("此页面的分数为", score);
    return score;
}

const onePage = async (page, url) => {
    url = url;
    let a = true;
    try {

        await sleep(2);
        await page.goto(url, "domcontentloaded");
        await sleep(2);

        let score = await grade(page);
        if (score >= 4) {
            a = await commentBack(page) && a;
            a = await addFriend(page) && a;
        } else {
            a = await agreeTalkTalk(page) && a;
        }

        await expandUrl(page);
    } catch (e) {
        console.log(e);
        console.log("getOnePage发生了以上错误");
        console.log("那我就去申请访问 请求好友了");
        a = await askPermission(page) && a;
    }

    a && console.log("大家都被限制了干脆休息");
    a && await sleep(60);

    try {
        await redis.connect();
        a ? await redis.sadd("qqZoneTask", url) : await redis.sadd("qqZoneAlready", url);
        await redis.end();
    } catch (e) {
        console.log(e);
        console.log("加入本地去重库出错");
    }
}

let run = async () => {

    await launchBrowser();
    await login("1634129053", "cqcp815");

    await startOut();
    process.exit();
}
run();



