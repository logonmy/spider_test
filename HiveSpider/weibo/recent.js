const puppeteer = require('puppeteer');
const Http = require("./api/http").Http;
const getApi = require("./api/fetch").getApi;
const http = require("http");
const fs = require("fs");
//这个东西要是能发着发着 顺便入到每日更新就好了

const debug = true;

(async () => {


    const beeName = "weibolHot";
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
            partition: beeName,
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
        return async (str) => {
            str = encodeURIComponent(str);
            let url = "http://chatbot.api.talkmoment.com/image/battle/battle/by/text?text=" + str + "&uid=0&limit=10";
            let re = await getApi(url);
            for (let r of re.result) {
                if (JSON.parse(r.R).src.indexOf("jpg") >= 0) {
                    let path = await downloadPic(JSON.parse(r.R).src);
                    return {
                        text: JSON.parse(r.R).text,
                        path: path,
                        src: JSON.parse(r.R).src
                    }
                }
            }
        }
    })()
    const postData = await (async (datas) => {
        let brick_id = (async () => {
            let getTrueName = () => {
                var date = new Date();
                var yyyy = date.getFullYear();
                var mm = date.getMonth() + 1;
                if (mm < 10) {
                    mm = "0" + mm.toString();
                }
                var dd = date.getDate();
                if (dd < 10) {
                    dd = "0" + dd.toString();
                }
                var name = yyyy + mm + dd + "更新";
                return name;
            }

            let trueName = getTrueName();

            let data = await Http.get("http://chatbot.api.talkmoment.com/lego/library/brick/list?limit=20&version=002");
            data = JSON.parse(data);
            data = data.result;
            for (let da of data) {
                if (da.name == trueName) {
                    return da.id;
                }
            }

            return false;
        })()
        const postDataToMessage = async (data) => {
            await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${beeName}`, data);
        }
        const postDataToDereplicate = async (data) => {
            let query = {
                partition: beeName,
                key: data.detailUrl.split("?")[0]
            };
            await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
        }
        const postWashTask = async (data) => {
            let washTask = {
                name: "wash_corpus",
                value: "",
                config: JSON.stringify({
                    bee_source: beeName,
                    brick_id: brick_id,
                    publish: true
                }),
                data: JSON.stringify(data),
                scheduled_at: Date.now()
            }
            let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
            return d.id;
        }
        const countTask = async (task_id, bee_name) => {
            let query = {
                task_id: task_id,
                name: beeName,
                state: "INTASK",
                created_at: Date.now()
            }
            await Http.call('http://bee.api.talkmoment.com/bee/wash/state/put', query);
        }
        console.log("postData初始化完毕");
        return async (datas) => {
            try {
                for (let data of datas) {
                    await postDataToMessage(data);
                    await postDataToDereplicate(data);
                    let task_id = await postWashTask(data);
                    await countTask(task_id);
                }
            } catch (e) {
                console.log(e, "回答数据出错");
            }
        }
    })();

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

    //回复原微博
    const recentBlog = (blogNode, context) => {
        return new Promise(async (resolve, reject) => {
            try{
                let input = await blogNode.$("input[type=file]");
                let pic = await askPic(context);
                console.log(context, "输入进来的context");
                await input.uploadFile(pic.path);
                await deletePic(pic.path);
                console.log("注入了 图片内容");

                let text = await blogNode.$("textarea[action-type=check]");
                await text.click();
                await sleep(90);
                pic.text = pic.text || "怼图啦 欢迎来战";
                await text.type(pic.text,{delay: 50});

                let post = await blogNode.$("div[action-type=feed_list_item] a[action-type=post]");
                await post.click();
                console.log("点击了 评论按钮");
                await sleep(90);
                resolve(pic);

            }catch(e){
                reject()
            }
        })
    }

    //回复微博的第一条评论
    const recentComment = async (blogNode, comment) => {
        return new Promise(async (resolve, reject) => {
            let btn = await blogNode.$(".WB_feed_repeat [node-type=reply]");
            await btn.click();
            try {
                let input = await blogNode.$(".WB_feed_repeat input[type=file]");
                let pic = await askPic(comment);
                await input.uploadFile(pic.path);
                await deletePic(pic.path);
                console.log("注入了 图片内容");
                let interval = setInterval(async () => {
                    let post = await blogNode.$(".WB_feed_repeat div[action-type=feed_list_item] a[action-type=post]");
                    await post.click();
                    console.log("点击了 评论按钮");
                    if (post.toString().indexOf("提交中") > 0 || post.toString().indexOf("W_btn_a_disable") > 0) {
                        clearInterval(interval);
                        resolve(pic);
                    }
                }, 2000);
            } catch (e) {
                await recentComment(blogNode, comment);
            }
        })
    }

//记录评论记录
    const recordDown = async (url, a, b, c, d) => {
        let recordName = "weiboRecord";
        let data = {
            url: url,
            context: a,
            context_img: b,
            comment: c,
            comment_img: d
        }
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${recordName}`, data);
    }

//热门行动 
    const searchHot = async () => {
        console.log("开始searchHot酱紫");
        const hotUrl = "https://d.weibo.com/";
        await pages[1].goto(hotUrl);

        try {
            await pages[1].waitForSelector(".WB_cardwrap.WB_feed_type.S_bg2.WB_feed_like");
        } catch (e) {
            console.log("search失败了 现在在重试");
            await pages[1].reload();
            await sleep(90);
            await searchHot();
            return;
        }
        let blogNodes;
        // 滚到底部
        try{
            await pages[1].evaluate((debug) => {
                return new Promise((resolve, reject) => {
                    let scrollTemp = 0;
                    let bottomCount = 0;
                    let interval = setInterval(function () {
                        window.scrollTo(0, document.documentElement.scrollTop + 100);
                        //todo 触底
                        try {
                            document.querySelector(".WB_cardmore.WB_cardmore_noborder").click();
                            document.querySelector(".WB_cardwrap.S_bg2 .empty_con a").click();
                        } catch (e) {
                            console.log("whatever");
                        }
                        if (window.scrollTop == scrollTemp) {
                            bottomCount++;
                            if (bottomCount >= 200) {
                                clearInterval(interval);
                                clearTimeout(timeout);
                                resolve();
                            }
                        } else {
                            scrollTemp = window.scrollTop;
                            bottomCount = 0;
                        }
                    }, 100)
                    let timeout = setTimeout(function () {
                        clearInterval(interval);
                        resolve();
                    }, debug ? 10 : 9999);
                })
            }, debug);
            log("已经滚到底部了");
            //todo 不是feed_list_item 好像是feed_content
            blogNodes = await pages[1].$$("div[action-type=feed_list_item]");
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
            log("已经删除重复热门");

            blogNodes = await pages[1].$$("div[action-type=feed_list_item]");
            // 点击评论
            let length = debug ? 10 : blogNodes.length;
            for (let i = 0; i < length; i++) {
                try {
                    let item = blogNodes[i];
                    let commentBtn = await item.$("a[action-type=fl_comment]");
                    await commentBtn.click();
                    await sleep(2);
                } catch (e) {
                    console.log(e);
                }
            }
            log("已经点击所有评论");
            //点开所有点开全文 并删除点开全文/收起全文按钮
            for (let i = 0; i < blogNodes.length; i++) {
                let openButton = blogNodes[i];
                try {
                    let button = await openButton.$$(".WB_text_opt");
                    if (button && button[0]) {
                        button = button[0];
                        await button.click();
                    }
                    ;
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
            log("已经点开所有点开全文");
            // 获取内容并上传到每日库
            let pageResult = await pages[1].evaluate(() => {
                return new Promise((resolve, reject) => {
                    var blogNodes = document.querySelectorAll("div[action-type=feed_list_item]:not([isforward='1'])");
                    var result = []
                    for (var blogNode of blogNodes) {
                        var TemplateData = {
                            source: "热门微博",
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
            postData(pageResult);

            // 删除所有不给评论的
            blogNodes = await pages[1].$$("div[action-type=feed_content]");
            for (let i = 0; i < blogNodes.length; i++) {
                let unable = await blogNodes[i].$$eval(".W_ficon.ficon_image.S_ficon_dis");
                if (!unable) {
                    await blogNodes[i].$$eval("[node-type=feed_content]", (node) => {
                        node.remove();
                    })
                }
            }
            console.log("已经删除了所有不给评论的");
        }catch(e){
            console.log("在展现页面的时候坏掉了", e);
        }
        //现在已经是完美的页面与完美的blogNodes了
        await sleep(30);
        blogNodes = await pages[1].$$("div[action-type=feed_list_item]");
        console.log(blogNodes.length, "最后剩余的blogNodes数量");
        let blogCount = 0;
        for (let blogNode of blogNodes) {
            try{
                let url = await blogNode.$eval("[node-type=feed_list_item_date]", (node) => {
                    return node.getAttribute("href")
                })
                let context = await blogNode.$eval("[node-type=feed_list_content]", (node) => {
                    return node.innerText;
                });
                console.log(context, "这是一个即将发过去的text", blogCount++);
                // let comment = await blogNode.$eval("[node-type=replywrap] .WB_text", (node) => {
                //     return node.innerText;
                // });
                let context_img = await recentBlog(blogNode, context);
                //let comment_img = await recentComment(blogNode, comment);
                await recordDown(url, context, context_img, comment);
                //await recordDown(context, context_img, comment, comment_img);
                await sleep();
            }catch(e){
                await sleep();
                console.log("最后一步的报错 很鸡儿烦", e);
            }
        }
    }

    (async () => {
        let user = {
            username: "guyiyang@gmail.com",
            password: "Washu1234"
        }
        await launchBrowser();
        await openIndex(user);
        await searchHot();
        console.log("跑完了 老哥 现在麻烦你去检查一下");
        //while (true) {}

    })();
})()