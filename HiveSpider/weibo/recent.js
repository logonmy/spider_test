const puppeteer = require('puppeteer');
const Http = require("./api/http").Http;
const getApi = require("./api/fetch").getApi;
const http = require("http");
const fs = require("fs");
//这个东西要是能发着发着 顺便入到每日更新就好了

const log = (str) => {
    let date = new Date();
    console.log(str + ">>>>>" + date);
};
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const deletePic = async (path) => {
    fs.unlinkSync(path);
}
const filterItems = async (data) => {
    let query = {
        partition: "weibohot",
        keys: data
    };
    let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
    res = JSON.parse(res);
    return res.result.filter_result;
};

const askPic = (() => {
    const suckUrl = (url) => {
        url = url.split("/");
        let l = url.length;
        return url[l - 1];
    }
    const downloadPic = (url) => {
        return new Promise((resolve, reject) => {
            http.get(url, function (res) {
                let imgData = "";

                res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


                res.on("data", function (chunk) {
                    imgData += chunk;
                });

                res.on("end", function () {
                    url = suckUrl(url);
                    fs.writeFile("/Users/cqcpcqp/Downloads/imgs/" + url, imgData, "binary", function (err) {
                        if (err) {
                            reject(err);
                        }
                        resolve("/Users/cqcpcqp/Downloads/imgs/" + url);
                    });
                });
            });
        })
    }
    return (str) => {
        str = encodeURIComponent(str);
        let url = "http://chatbot.api.talkmoment.com/image/battle/battle/by/text?text=" + str + "&uid=0&limit=10";
        let re = await
        getApi(url);
        for (let r of re.result) {
            if (JSON.parse(r.R).src.indexOf("jpg") >= 0) {
                let path = await
                downloadPic(JSON.parse(r.R).src);
                return {
                    text: JSON.parse(r.R).text,
                    path: path,
                    src: JSON.parse(r.R).src
                }
            }
        }
    }
})()
const postData = (() => {
    //todo
})()

let hotQueue = [];
let expandQueue = [];

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
        width: 1360,
        height: 765,
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
    await sleep(3);
    await userName.click();
    await sleep(3);
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
    await recentPic();
};

//热门行动 
const searchHot = async () => {
    const hotUrl = "https://d.weibo.com/";
    await pages[1].goto(hotUrl);

    try {
        await pages[1].waitForSelector(".WB_cardwrap.WB_feed_type.S_bg2.WB_feed_like");
    } catch (e) {
        console.log("search失败了 现在在重试");
        await pages[1].reload();
        await sleep();
        await recentPic();
        return;
    }

    // 滚到底部
    await pages[1].evaluate(() => {
        return new Promise((resolve, reject) => {
            let scrollTemp = 0;
            let bottomCount = 0;
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 100);
                //todo 触底
                try {
                    document.querySelector(".WB_cardmore.WB_cardmore_noborder").click()
                    document.querySelector(".WB_cardwrap.S_bg2 .empty_con a").click()
                } catch (e) {
                    console.log("whatever");
                }
                if (window.scrollTop == scrollTemp) {
                    bottomCount++;
                    if (bottomCount >= 200) {
                        clearInterval(interval);
                        resolve();
                    }
                } else {
                    bottomCount = 0;
                }
            }, 50)
        })
    });
    //todo 不是feed_list_item 好像是feed_content
    let blogNodes = await pages[1].$$("div[action-type=feed_list_item]");
    //剔除重复热门
    let hrefs = await pages[1].evaluate(() => {
        return new Promise((resolve, reject) => {
            let hrefs = [];
            let dates = document.querySelectorAll("div[action-type=feed_list_item] [node-type=feed_list_item_date]");
            for (let da of dates) {
                hrefs.push(da.getAttribute("href"));
            }
            resolve(hrefs);
        })
    })
    hrefs = await filterItems(hrefs);
    for (let i = 0; i < blogNodes.length; i++) {
        if (!hrefs[i]) {
            await blogNodes[i].$$eval("[node-type=feed_content]", (node) => {
                node.remove();
            })
        }
    }

    blogNodes = await pages[1].$$("div[action-type=feed_list_item]");
    // 点击评论
    for (let i = 0; i < blogNodes.length; i++) {
        try {
            let item = blogNodes[i];
            let commentBtn = await item.$("a[action-type=fl_comment]");
            await commentBtn.click();
        } catch (e) {
            console.log(e);
        }
    }
    //点开所有点开全文 并删除点开全文/收起全文按钮
    for (let i = 0; i < blogNodes.length; i++) {
        let openButton = blogNodes[i];
        try {
            let button = await openButton.$$(".WB_text_opt");
            if (button && button[0]) {
                button = button[0]
                await button.click()
            }
            ;
            button = await openButton.$$(".WB_text_opt");
            if (button && button[0]) {
                button = button[0]
                await button.click()
            }
        } catch (e) {
            console.log(e);
        }
    }
    await pages[0].evaluate(() => {
        let buttons = document.querySelectorAll(".WB_text_opt");
        for (let button of buttons) {
            button.remove();
        }
    })

    // 获取内容并上传到每日库
    let pageResult = await pages[1].evaluate(() => {
        return new Promise((resolve, reject) => {
            var blogNodes = document.querySelectorAll("div[action-type=feed_list_item]:not([isforward='1'])");
            var result = []
            for (var blogNode of blogNodes) {
                var TemplateData = {
                    title: "",
                    transmieCount: 0,
                    commentCount: 0,
                    agreeCount: 0,
                    created_at: 0,
                    comments: [],
                    imgs: [],
                    video: {
                        src: "",
                        cover_img: {
                            src: "",
                            width: 0,
                            height: 0
                        }
                    },
                    detailUrl: ""
                }
                let existAndReturn = (str) => {
                    if (blogNode.querySelectorAll(str)) {
                        let result = parseInt(blogNode.querySelectorAll(str)[1].innerText.trim());
                        if (result === null) {
                            return 0
                        }
                        return result;
                    } else {
                        return 0;
                    }
                }
                TemplateData.transmieCount = existAndReturn("[action-type=fl_forward] .line.S_line1 em");
                TemplateData.commentCount = existAndReturn("[action-type=fl_comment] .line.S_line1 em");
                TemplateData.agreeCount = existAndReturn("[action-type=fl_like] .line.S_line1 em");

                try {
                    let created_at = new Date(blogNode.querySelector(".feed_list_item_date em").innerText);
                    if (created_at == "Invalid Date") {
                        throw new Error("时间格式不对");
                    } else {
                        TemplateData.created_at = created_at.getTime();
                    }
                } catch (e) {
                    TemplateData.created_at = new Date().getTime();
                }

                if (blogNode.querySelector("[node-type=feed_list_content_full]")) {
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content_full]").innerText;
                } else if (blogNode.querySelector("[node-type=feed_list_content]")) {
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content]").innerText;
                }
                console.log(blogNode);
                TemplateData.detailUrl = blogNode.querySelector("[node-type=feed_list_item_date]").getAttribute("href");

                //comment
                var comments = blogNode.querySelectorAll("[node-type=feed_list_repeat] [node-type=replywrap] .WB_text");
                for (var comment of comments) {
                    TemplateData.comments.push(comment.innerText);
                }
                //img
                var imgs = blogNode.querySelectorAll(".WB_pic img");
                for (var img of imgs) {
                    var tempImg = {
                        src: "",
                        width: 0,
                        height: 0
                    };
                    tempImg.src = "http:" + img.getAttribute("src");
                    tempImg.width = img.naturalWidth;
                    tempImg.height = img.naturalHeight;
                    TemplateData.imgs.push(tempImg)
                }

                //video
                if (blogNode.querySelector(".WB_video")) {
                    var video = blogNode.querySelector(".WB_video");
                    TemplateData.video.cover_img.src = "http:" + video.querySelector(".con-1.hv-pos img").getAttribute("src");
                    TemplateData.video.cover_img.width = video.querySelector(".con-1.hv-pos img").naturalWidth;
                    TemplateData.video.cover_img.height = video.querySelector(".con-1.hv-pos img").naturalHeight;
                    TemplateData.video.src = video.querySelector("video").getAttribute("src");
                }

                result.push(TemplateData);
            }
            resolve(result);
        })
    })
    await postData(pageResult);

    // 删除所有不给评论的
    blogNodes = await pages[1].$$("div[action-type=feed_content]");
    //算了 不想写了 我回家了 啊 心累 怎么办 这里 算一下那个标是不是绿的 应该是看一下class
    for (let i = 0; i < blogNodes.length; i++) {
        if (!hrefs[i]) {
            await blogNodes[i].$$eval("[node-type=feed_content]", (node) => {
                node.remove();
            })
        }
    }

    //好了 反正这里就已经是一个完美的页面了 然后
    await callbackPic();
}
const callbackPic = async () => {

}

const recentPic = async () => {
    console.log("开始发图了 你晓得的吧");
    let href = "https://weibo.com/mamypokocn?profile_ftype=1&is_all=1#1529895889374";
    await pages[0].goto(href);

    try {
        await pages[0].waitForSelector("div[action-type=feed_list_item] a[action-type=fl_comment]");
    } catch (e) {
        console.log("recent失败了 现在在重试");
        await pages[0].reload();
        await sleep();
        await recentPic();
        return;
    }
    //todo something replace sleep
    await sleep(1);
    let commentBtn = await pages[0].$("div[action-type=feed_list_item] a[action-type=fl_comment]");
    await commentBtn.click();
    console.log("打开了 评论的列表");
    try {
        await pages[0].waitForSelector("input[type=file]");
    } catch (e) {
        console.log("recent失败了 现在在重试");
        await pages[0].reload();
        await sleep();
        await recentPic();
        return;
    }
    let input = await pages[0].$("input[type=file]");
    await input.uploadFile("/Users/cqcpcqp/Downloads/test.jpg");
    console.log("注入了 图片内容");
    let interval = setInterval(async () => {
        let post = await pages[0].$("div[action-type=feed_list_item] a[action-type=post]");
        await post.click();
        console.log("点击了 评论按钮");
        if (post.toString().indexOf("提交中") > 0) {
            clearInterval(interval);
        }
    }, 2000);
};

(async () => {
    // let user = {
    //     username: "guyiyang@gmail.com",
    //     password: "Washu1234"
    // }
    // await launchBrowser();
    // await openIndex(user);
    // console.log("跑完了 老哥 现在麻烦你去检查一下");
    //let data = await askPic("迷茫");
    //let re = await askPic("老哥");

    //await deletePic(re.path);
    //console.log(re);
})();