const puppeteer = require("puppeteer");
let firstHref = "https://passport.baidu.com/v2/?login";


let pages = [void 0, void 0];
let browser;
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

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
        width: 1860,
        height: 1500,
        isLandscape: true
    });
    console.log("打开baidu首页");
};

const waha = async () => {
    try {
        await pages[0].goto(firstHref);
    } catch (e) {
        console.log("打开百度登录失败，正在重试");
        await pages[0].reload();
        await sleep();
        return;
    }
    console.log("已启动");
}

const main = async (number) => {
    let input = await pages[0].$(".pass-text-input.pass-text-input-phone");
    await input.click();
    await input.type(number);
    let input2 = await pages[0].$(".pass-text-input.pass-text-input-password");
    await input2.click();

    try {
        await pages[0].waitForSelector(".pass-button.pass-button-grey.cancel");
        console.log("好号码");
    } catch (e) {
        console.log("坏号码");
    }
}


(async () => {
    await launchBrowser();
    await waha();

    let bu = await pages[0].$(".pass-reglink.pass-link");
    await bu.click();

    let check = async () => {
        let Pages = await browser.pages();
        if (Pages.length === 2) {
            await sleep(0.1);
            await check();
        } else {
            pages[0] = Pages[2];
            await Pages[1].close();
            await main("15351799999");
        }
    }
    await check();
})()

