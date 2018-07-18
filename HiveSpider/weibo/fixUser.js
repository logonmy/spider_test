const puppeteer = require('puppeteer');
const Http = require("../../nodePart/api/http").Http;
const getApi = require("../../nodePart/api/fetch").getApi;
const File = require("fs");
const queue = require("../../nodePart/api/queue").Queue;

let pages = [void 0, void 0];

const BEE_NAME = "weiboFixUser";

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

let user = {
    username: "1028166012@qq.com",
    password: "ding/19930731"
}

let browser;

(async () => {
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
        console.log("打开微博首页");
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
        console.log("开始登陆");
        try {
            await pages[0].waitForFunction("document.querySelector('title').innerHTML.indexOf('我的首页')>=0");
            console.log("登录成功");
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
        try {
            await pages[0].waitForFunction("document.querySelector('title').innerHTML.indexOf('我的首页')>=0");
        } catch (e) {
            console.log("登录失败，正在重试");
            await pages[0].reload();
            await sleep();
            await openIndex(user);
            return;
        }
    };

    const searchOneWord = async (key) => {
        let href = "http://s.weibo.com/user/" + key + "&auth=ord&gender=man&age=22y"

        await pages[0].goto(href);

        const getPageContent = async () => {
            let pageContents = await pages[0].evaluate(() => {
                let results = [];
                let guys = document.querySelectorAll(".list_person");
                for (let guy of guys) {
                    let da = {};
                    da.avatarUrl = guy.querySelector("a").getAttribute("href");
                    da.name = guy.querySelector("a").getAttribute("title");
                    da.sex = "man";
                    da.addr = guy.querySelector(".person_addr").innerText.split("//wei")[0].trim();
                    da.detail = guy.querySelector(".list_person .person_num").innerText;
                    da.url = guy.querySelector(".person_addr a").getAttribute("href");
                    results.push(da);
                }

                setInterval(function(){
                    window.scrollTo(0, document.documentElement.scrollTop + 100);
                }, 200)

                return results;
            })
            for(let c of pageContents){
                await queue.postDataToMessage("weiboManUsers", c);
            }
        };
        const jumpToNextPage = async () => {
            await pages[0].waitForSelector(".page.next.S_txt1.S_line1");
            let nextButton = await pages[0].$(".page.next.S_txt1.S_line1");
            await nextButton.click();
        };
        const run = async () => {
            try {
                await getPageContent();
                await sleep(Math.random() * 5 + 4);
                await jumpToNextPage();
                await sleep(Math.random() * 5 + 1);
                await run()
            } catch (e) {
                console.log(e);
                console.log("???????");
            }
        };
        await run();
    }


    (async () => {
        let user = {
            username: "1028166012@qq.com",
            password: "ding/19930731"
        }
        await launchBrowser();
        await openIndex(user);

        while (true) {
            await sleep(Math.random() * 5 + 4);
            let key = await queue.getDataFromMessage("3499KeyWord");
            key = key.result;
            while (key.indexOf('"') > -1) {
                key = key.replace('"', '');
            }
            console.log("获取到一大批的关键词");
            try{
                await searchOneWord(key);
            }catch(e){
                console.log("whatever hahahaha");
            }
        }
    })();

})()