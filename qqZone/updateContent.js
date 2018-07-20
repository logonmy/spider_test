// 1634129053---- cqcp815 大号

// 2110998942----washu123456 表情套图 每日更新 Washu1234
// 3185303424----washu123456 全网最骚贱表情包
// 2728703162----washu123456
// 2657981304----washu123456
// 3275440566----washu123456

const puppeteer = require('puppeteer');
const getApi = require("../nodePart/api/fetch").getApi;

const logNow = () => {
    function pad(number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }

    function toLastModifiedString(date) {
        return pad(date.getMonth() + 1) +
            "/" + pad(date.getDate()) +
            "/" + date.getFullYear() +
            " " + pad(date.getHours()) +
            ":" + pad(date.getMinutes()) +
            ":" + pad(date.getSeconds());
    }

    console.log(toLastModifiedString(new Date()));
}

let pages = [void 0, void 0, void 0, void 0, void 0, void 0];
let browser;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

const launchBrowser = async () => {
    const args = [
        '-no-sandbox',
        '--disable-setuid-sandbox',
        '--ppapi-flash-version=30.0.0.134',
        '--ppapi-flash-path=/Library/Internet\\ Plug-Ins/PepperFlashPlayer/PepperFlashPlayer.plugin'
    ]

    browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome',
        timeout: 0,
        args
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

const publish = async () => {
    await pages[0].waitForSelector(".item.bor3.bg4.item-pic.evt_hover");
    let b1 = await pages[0].$(".item.bor3.bg4.item-pic.evt_hover");
    await b1.hover();
    await sleep(2);

    let input = await pages[0].$("#qz_app_imageReader_1");
    await input.uploadFile("/Users/cqcpcqp/Downloads/imgs/20180717784681_wiagJo.jpg");
    console.log("注入图片完成")
    let send = pages[0].$(".btn-post.gb_bt.evt_click");
    await send.click();
}

let run = async (a) => {
    await launchBrowser();
    await login(a.usr, a.pas);
    await publish();
}
var us = {
    usr: "2110998942",
    pas: "washu123456"
}
run(us);


process.on("message", async function (d) {
    console.log("收到爸爸的指导", d);
    await run(d.user);
})