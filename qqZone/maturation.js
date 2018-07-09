// 1634129053---- cqcp815 大号
const puppeteer = require('puppeteer');
const getApi = require("../nodePart/api/fetch").getApi;

const RedisClient = require("../nodePart/api/redis").RedisClient;
const redis = new RedisClient({host: "127.0.0.1", port: 6379});

const config = {
    fatherScore: 0,
    firstTimeScore: 0,
    intervalScore: 0,
    agreeCommentScore: 0,

    addFriendRequire: 20,
    agreeRequire: 200,
    commentRequire: 20,
    applyRequire: 50,

    taskName: "qqZoneTask",
    alreadyName: "qqZoneAlready"
}


let pages = [void 0, void 0, void 0, void 0, void 0, void 0];
let browser;
let chongfuCount = 0;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

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

let debugCount = 0;
let dereplicateSet = new Set();
let permissionCount = 0;
let addFriendCount = 0;


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
        console.log(Pages[0].url(), "0")
        console.log(Pages[1].url(), "1")
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
    let url = await popSet("")
    let url = taskUrls.shift();
    await onePage(pages[0], url);
    console.log("==========  finish ONE  ==========");
    await sleep(1);
    await startOut();
}

//加好友
let addFriend = async (page) => {
    try {
        let addButton = await page.$("[data-cmd=add_friend]");
        await addButton.click();
        await sleep(1);
        let confirmButton = await page.$(".txt");
        await confirmButton.click();
        console.log("已经添加好友了了", addFriendCount++, "人");
    } catch (e) {
        console.log(e)
        console.log("点赞出错");
    }
}

//申请访问
let askPermission = async (page) => {
    try {
        let requestButton = await page.$("[data-cmd=apply_request]");
        await requestButton.click();
        await sleep(1);
        let textArea = await page.$("#msg-area");
        await textArea.click();
        await textArea.type("麻烦同意一下喽", {delay: 100});
        let confirmButton = await page.$(".qz_dialog_layer_btn.qz_dialog_layer_sub");
        await confirmButton.click();
        console.log("已经申请访问了", permissionCount++, "人");
        await addFriend(page)
    } catch (e) {
        console.log(e)
        console.log("申请访问出错");
    }

}

let onePage = async (page, url) => {
    url = url || "https://user.qzone.qq.com/303093558";
    try {

        await sleep(2);
        await page.goto(url, "domcontentloaded");
        await sleep(2);

        let contentFrame = page.mainFrame().childFrames()[0];

        //对第一条说说进行评论
        let agreeButton = await contentFrame.$(".fui-icon.icon-op-praise");
        await agreeButton.click();
        console.log("点击完毕了， 还是蛮鸡儿惊人的");

        //获取所有别人的链接
        let b = await contentFrame.$$eval(".q_namecard", nodes => nodes.map(n => n.getAttribute("href")));
        for (let a of b) {
            if (a && !dereplicateSet.has(a)) {
                await redis.connect();
                let re = await redis.sadd("qqZoneTask", a);
                if(re === 0){
                    console.log("已经重复了多少次了", chongfuCount++);
                }else{
                    dereplicateSet.add(a);
                    taskUrls.push(a);
                }
                await redis.end();
            }
        }
        console.log(debugCount++, "这是已经遍历完的第多少页");
        console.log(taskUrls.length, "现在已经存的taskUrl长度");
    } catch (e) {
        console.log(e);
        console.log("getOnePage发生了以上错误");
        console.log("那我就去申请访问 请求好友了");
        await askPermission(page);
    }

    console.log("不管是申请访问的 还是点赞的 都统一处理入不再便利库中");
    try{
        await redis.connect();
        await redis.sadd("qqZoneAlready", url);
        await redis.end();
    }catch(e){
        console.log(e);
        console.log("加入本地去重库出错");
    }
}

let popSet = async (key) => {
    try{
        await redis.connect();
        let re = await redis.srandmember(key, 1);
        await redis.srem(key, re[0]);
        await redis.end();
        return re[0];
    }catch(e){
        console.log("whatever");
    }
}

let run = async () => {

    await launchBrowser();
    await login("1634129053", "cqcp815");

    let re = await popSet("qqZoneTask");
    taskUrls.push(re);

    await startOut();

    // await redis.connect();
    // await redis.sadd("qqZoneTask", "https://user.qzone.qq.com/2606118571");
    // await redis.sadd("qqZoneTask", "https://user.qzone.qq.com/995865869");
    // await redis.end();
}
run();



