const puppeteer = require('puppeteer');
const Http = require("./api/http").Http;
const getApi = require("./api/fetch").getApi;
const http = require("http");
const fs = require("fs");
const readLine = require("lei-stream").readLine;
//这个东西要是能发着发着 顺便入到每日更新就好了

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

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

    const oneUser = async (url) => {
        await pages[0].goto(url);
        let result = [];
        let data = [];

        let getData = async () => {
            let pageResult = [];
            try {
                pageResult = await pages[0].evaluate(() => {
                    let follows = [];
                    try {

                        let items = document.querySelectorAll(".follow_item.S_line2");
                        for (let item of items) {
                            let re = {}
                            re.url = item.querySelector(".info_name a").getAttribute("href");
                            re.name = item.querySelector(".info_name a").innerText;
                            re.desc = item.querySelector(".info_intro").innerText;
                            follows.push(re);
                            console.log(re);
                        }
                    } catch (e) {

                    }
                    return follows;
                })

                let q = await pages[0].evaluate(() => {

                })
                let as = await pages[0].$$(".W_pages a");

                await as[as.length].click();

            } catch (e) {

            }


            return pageResult;
        }

        for (let i = 0; i < 1; i++) {
            await sleep(1);
            data = await getData();

            if (data.length == 0) {
                break;
            }
            result = result.concat(data);
        }
        console.log(result);
        for(let re of result){
            fs.appendFileSync("www.txt", JSON.stringify(re) + "\n");
        }
    }


    (async () => {
        let user = {
            username: "15351702865",
            password: "cqcp815"
        }
        await launchBrowser();
        await openIndex(user);
        let i = 1;
        readLine("urls.txt").go(async (data, next) => {
            if(i < 4577){
                i++;
                console.log(i, "跳过");
                next();
            }else{
                await oneUser(data);
                console.log("已经跑完第 ", i++, " 个");
                next();
            }
        })

    })();
})()