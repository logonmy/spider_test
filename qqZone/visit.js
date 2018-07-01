const puppeteer = require('puppeteer');
const getApi = require("../nodePart/api/fetch").getApi;

let pages = [void 0, void 0, void 0, void 0, void 0, void 0];
let browser;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

let debugCount = 0;
let taskUrls = ["https://user.qzone.qq.com/1260153978"];
let dereplicateSet = new Set();

const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        timeout: 0,
        devtools: false
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
    let switchBtton = await loginFrame.$("#switcher_plogin");
    await switchBtton.click();


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
// const transmit = async () => {
//     console.log("开始转发");
//     let click = async () => {
//         try {
//             let textInput = await pages[0].$(".fui-icon.icon-op-share");
//             await textInput.click();
//
//             let confirmButton = await pages[0].$("input[type=button].gb_bt.gb_bt2");
//             await confirmButton.click();
//         } catch (e) {
//             await sleep(1);
//             await click();
//         }
//     }
//     await click();
//     console.log("#######################")
// }
// const public = async(text) => {
//     await sleep();
//     let textInput = await pages[0].$(".textinput.textarea.c_tx3");
//     await textInput.click();
//     await textInput.type(text);
//
//     let send = await pages[0].$(".btn-post.gb_bt.evt_click");
//     await send.click();
//     console.log("#######################")
// }

let startOut = async () => {
    let url = taskUrls.shift();
    await onePage(pages[0], url, false);
    console.log("==========  finish ONE  ==========");
    await sleep(5);
    await startOut();
}

//跳转方式优化

//加好友
let addFriend = async (page) => {
}

//申请访问
let askPermission = async (page) => {

}

let onePage = async (page, url, run) => {
    url = url || "https://user.qzone.qq.com/909265728";
    try {
        await page.goto(url, "domcontentloaded");
        console.log(debugCount++, "这是已经visit完的第多少页");


        let contentFrame = page.mainFrame().childFrames()[0];
        //获取所有别人的链接
        let b = await contentFrame.$$eval(".q_namecard", nodes => nodes.map(n => n.getAttribute("href")));
        console.log(b);
        for (let a of b) {
            if (a && !dereplicateSet.has(a)) {
                dereplicateSet.add(a);
                taskUrls.push(a);
            }
        }

        console.log(taskUrls.length, "现在已经存的taskUrl长度");

    } catch (e) {
        console.log(e);
        console.log("getOnePage发生了巨大的错误");
    }
}

let run = async () => {
    await launchBrowser();
    await login("1634129053", "cqcp815");
    await startOut();
}
run();