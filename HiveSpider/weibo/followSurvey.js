const puppeteer = require('puppeteer');
const Http = require("./api/http").Http;
const getApi = require("./api/fetch").getApi;
const http = require("http");
const fs = require("fs");
//这个东西要是能发着发着 顺便入到每日更新就好了

const debug = true;

(async () => {

    const log = (str) => {
        let date = new Date();
        console.log(str + ">>>>>" + date);
    };
    const sleep = (s = 5) => {
        return new Promise(resolve => setTimeout(resolve, s * 1000))
    };

    //启动puppeteer
    let pages = [];
    const launchBrowser = async () => {
        browser = await puppeteer.launch({
            headless: false,
            executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
            timeout: 0,
            devtools: false
        });
        log("启动浏览器成功");
        pages[0] = await browser.newPage();
        pages[1] = await browser.newPage();
        await pages[0].setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko)" +
            " Chrome/62.0.3202.75 Safari/537.36");
        await pages[0].setViewport({
            width: 1860,
            height: 1500,
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
        try {
            await pages[0].waitForFunction("document.querySelector('title').innerHTML.indexOf('我的首页')>=0");
            log("登录成功");
            return;
        } catch (e) {

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
        await sleep(1);
        await userName.click();
        await sleep(1);
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


    (async () => {
        let user = {
            username: "15351702865",
            password: "cqcp815"
        }
        await launchBrowser();
        await openIndex(user);
        await searchHot();
        console.log("跑完了 老哥 现在麻烦你去检查一下");
        //while (true) {}

    })();
})()