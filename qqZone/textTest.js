// 1634129053---- cqcp815 大号
// https://user.qzone.qq.com/1634129053

// 账号库存
// 3381904441----f1b38o8 //die
// 2534227914----pt07hwdwvf //die
// 3262987041----44xzgph //die
// 3021353180----zmji04c8r //die
// 2050435249----wf7x5pl6 //强大的号 耐得住摧残
// 3441282935----ep3k4bw //die
// 3088230281----cl4r40q //die
// 3168895110----scuxr1z4 //die
// 3196302579----lu542941
// 3498462319----ttksrknl

// 2915297041----Washu1234----您父亲的姓名是？----UmDNbw----您母亲的姓名是？----HauVNE----您母亲的职业是？----BEfzyz

//优化记录
//语料变更为以图怼文字 返回的title
//优化评论内容文字输入间隔
//延长发评论后 跳转到新页面时间
//添加滚来滚去操作
//增强账号信用程度
//跳转方式优化 没做

const puppeteer = require('puppeteer');
const getApi = require("../nodePart/api/fetch").getApi;

let pages = [void 0, void 0, void 0, void 0, void 0, void 0];
let browser;

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
let taskUrls = ["https://user.qzone.qq.com/2895615237"];
let dereplicateSet = new Set();

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
    await onePage(pages[0], url);
    console.log("==========  finish ONE  ==========");
    await sleep(5);
    await startOut();
}

//加好友
let addFriend = async (page) => {
    // https://user.qzone.qq.com/249563160
    // https://user.qzone.qq.com/1448091956
    // document.querySelector("[data-cmd=add_friend]").click()
    // document.querySelector(".txt")

    try{
        let addButton = await page.$("[data-cmd=add_friend]");
        await addButton.click();
        let confirmButton = await page.$(".txt");
        await confirmButton.click();
        await askPermission();
    }catch(e){
        console.log(e)
        console.log("点赞出错");
    }

}

//申请访问
let askPermission = async (page) => {
    // https://user.qzone.qq.com/1448091956
    // document.querySelector("[data-cmd=apply_request]")
    // document.querySelector("#msg-area")
    // document.querySelector(".qz_dialog_layer_btn.qz_dialog_layer_sub")

    try{
        let requestButton = await page.$("");
        await requestButton.click();
        let textArea = await page.$("#mag-area");
        await textArea.click();
        await textArea.type("麻烦同意一下喽");
        let confirmButton = await page.$(".qz_dialog_layer_btn.qz_dialog_layer_sub");
        await confirmButton.click();
    }catch(e){
        console.log(e)
        console.log("申请访问出错");
        await addFriend();
    }

}


let onePage = async (page, url) => {
    url = url || "https://user.qzone.qq.com/909265728";
    try {

        await sleep(2);
        await page.goto(url, "domcontentloaded");
        await sleep(2);

        await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                window.scrollTo(0, document.documentElement.scrollTop + 100);
                setTimeout(function () {
                    window.scrollTo(0, document.documentElement.scrollTop + 500);
                }, 100)
                setTimeout(function () {
                    window.scrollTo(0, document.documentElement.scrollTop + 500);
                }, 800)
                setTimeout(function () {
                    window.scrollTo(0, document.documentElement.scrollTop + 400);
                }, 1500)
                setTimeout(function () {
                    resolve();
                    window.scrollTo(0, document.documentElement.scrollTop - 400);
                }, 2200)
            });
        });


        let contentFrame = page.mainFrame().childFrames()[0];

        //对第一条说说进行评论
        let rawText = await contentFrame.$$eval(".f-info", nodes => nodes.map(n => n.innerText));
        let text = await askText(rawText);
        let input = await contentFrame.$(".textinput.textinput-default a");
        await input.click();
        console.log("click input");
        await sleep(1);
        await input.type(text, {delay: 100});
        console.log("文字输入");
        await sleep(1);
        let sendButton = await contentFrame.$(".btn-post.gb_bt.evt_click");
        await sendButton.click();
        await sleep(1);
        console.log("send text");

        //获取所有别人的链接
        let b = await contentFrame.$$eval(".q_namecard", nodes => nodes.map(n => n.getAttribute("href")));
        for (let a of b) {
            if (a && !dereplicateSet.has(a)) {
                dereplicateSet.add(a);
                taskUrls.push(a);
            }
        }
        console.log(debugCount++, "这是已经遍历完的第多少页");
        console.log(taskUrls.length, "现在已经存的taskUrl长度");

    } catch (e) {
        console.log(e);
        console.log("getOnePage发生了以上错误");
    }
}

let run = async () => {

    await launchBrowser();
    await login("2915297041", "Washu1234");
    await startOut();

}
run();