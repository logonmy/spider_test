const puppeteer = require('puppeteer');
const File = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");

const email = "intelplugcheker01@gmail.com"
const passwordT = "intel01"
const titleT = "titleTest"



const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const log = (str) => {
    let date = new Date();
    console.log(str + ">>>>>" + date);
};
let pages = [null, null];
const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        timeout: 0,
        devtools: false
    });
    log("启动浏览器成功");
    pages[1] = await browser.newPage();
    pages[0] = await browser.newPage();
    await pages[0].setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko)" +
        " Chrome/62.0.3202.75 Safari/537.36");
    await pages[0].setViewport({
        width: 1920,
        height: 1080,
        isLandscape: true
    });
    log("打开查重首页");
    try {
        await pages[0].goto('https://www.turnitin.com', {
            waitUntil: "domcontentloaded",
            timeout: 10000
        });
        console.log("成功打开首页")
    } catch (e) {
        console.log(e)
    }
    return;
};

const login = async () => {
    try {
        log("开始登录")
        await pages[0].waitForSelector(".app-links")
        await pages[0].evaluate(() => {
            let loginButton = document.querySelectorAll(".app-links a")[1];
            loginButton.click();
        })

        await pages[0].waitForSelector("#email");
        const userName = await pages[0].$("#email");
        await userName.click();
        await userName.type(email);

        await sleep(2)

        await pages[0].waitForSelector("#password");
        const password = await pages[0].$("#password");
        await password.click();
        await password.type(passwordT);

        const login = await pages[0].$("input[name=submit]");
        await login.click();
        log("点击login");
    } catch (e) {
        await login();
    }

}

const Assign = async () => {
    try {
        await pages[0].waitForSelector(".class_name a")
        const assign = await pages[0].$(".class_name a");
        await assign.click();
    } catch (e) {
        console.log(e, "assigning error");
        await sleep(1)
        await pages[0].reload();
        await Assign();
    }
}

const view = async () => {
    try {
        await pages[0].waitForSelector(".assgn-inbox a")
        const assign = await pages[0].$(".assgn-inbox a");
        await assign.click();
    } catch (e) {
        console.log(e, "viewing error");
        await sleep(1)
        await pages[0].reload();
        await view()
    }
}

const submit = async () => {
    try {
        await pages[0].waitForSelector(".matte_button")
        const submit = await pages[0].$(".matte_button");
        await submit.click();
    } catch (e) {
        console.log(e, "viewing error");
        await sleep(1)
        await pages[0].reload();
        await submit()
    }
}


const upload = async () => {
    try {
        await pages[0].waitForSelector("#author_first", {
            timeout: 10000
        })
        await pages[0].waitForSelector("#author_last")
        await pages[0].waitForSelector("#title");

        const firstName = await pages[0].$("#author_first");
        await firstName.click();
        // for(let i = 0;i< 20;i++){
        //     await firstName.press("BackSpace");
        // }
        await firstName.type(email);

        const secondName = await pages[0].$("#author_last");
        await secondName.click();
        // for(let i = 0;i< 20;i++){
        //     await secondName.press("BackSpace");
        // }
        await secondName.type(email);

        const title = await pages[0].$("#title");
        await title.click();
        // for(let i = 0;i< 20;i++){
        //     await title.press("Backspace");
        // }
        await title.type(titleT);

        await pages[0].waitForSelector("#selected-file");
        await sleep(5);


        // select-file-clear

        // await pages[0].evaluate(() => {
        //     while(true){
        //         let unOk = document.querySelector(".btn.btn-primary.state-choose-file");
        //         if(!unOk){
        //             return;
        //         }
        //     }
        // })
        console.log("upload已经可以点击了");
        let upload = async () => {
            const fileInput = await pages[0].$("#selected-file");
            await fileInput.uploadFile("/Users/cqcpcqp/Downloads/conseling.pdf");
            console.log("成功upload");
            await sleep(5);
            await pages[0].waitForSelector("#upload-btn", {
                visible: true
            })
            console.log("找到了upload-btn")
            let sendButton = await pages[0].$("#upload-btn");
            await sendButton.click();
        }
        try {
            await upload()
        } catch (e) {
            await upload();
        }


    } catch (e) {
        console.log(e, "uploading error");
        await sleep(1)
        try {
            await pages[0].reload();

        } catch (e) { }
        await upload();
    }
}

const confirm = async () => {

    try {
        await pages[0].waitForSelector("#confirm-btn", {
            visible: true
        })
        let button = await pages[0].$("#confirm-btn");
        await button.click()
    } catch (e) {
        console.log(e, "confirming error");
        console.log(Date.now());
        await sleep(1)
    }
    try {
        await pages[0].waitForSelector("#close-btn", {
            timeout: 10000
        });
        let doc = await pages[0].$("#close-btn");
        await doc.click();
    } catch (e) {
        await confirm()
    }
}
const download = async (url) => {
    await pages[1].goto(url);
    try {
        await pages[1].evaluate(() => {
            if (document.querySelector("li")) {
                try {
                    let li = document.querySelectorAll("li")[1];
                    li.click();
                } catch (e) {

                }
            }
            return;
        })
    } catch (e) {
        console.log("whatever")
    }
}
const getResult = async () => {
    await pages[0].waitForSelector(".or-link");
    await sleep(2);
    let re = await pages[0].evaluate(() => {
        let ols = document.querySelectorAll(".or-link");
        let link = ols[ols.length - 1];
        let re = link.querySelector("span").innerText;
        let ss = document.querySelectorAll(".student--1");
        link = ss[ss.length - 1];
        let href = link.querySelector(".dl_file").getAttribute("href");
        return {
            re: re,
            href: href
        };
    })
    console.log(re);
    let href;
    re.href = re.href.split("'")
    for (let r of re.href) {
        if (r.indexOf("download") > -1) {
            href = r;
        }
    }
    href = "https://www.turnitin.com" + href;
    console.log(href)
    await download(href);
    console.log(re.re);
    return re;
}

(async () => {
    await launchBrowser();
    await login();
    await Assign();
    await view();
    await submit();
    await upload();
    await confirm();
    await getResult();
})()