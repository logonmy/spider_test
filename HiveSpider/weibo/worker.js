const puppeteer = require('puppeteer');
const File = require("fs");
//add
//navigation Timeout 事件捕获
const log = (str) => {
    let date = new Date();
    console.log(str + ">>>>>" + date);
};
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const rmAnnotation = (str) => {
    if (str) {
        return str.replace(/<!--(.|\s)*?-->/g, "");
    } else {
        return str;
    }
};

const debug = false;

const PUPPERTTER_LIMIT = 4;

let errTime = 0;
let bottomErrTime = 0;
let pages = [void 0, void 0];
let browser;

let task;

//调度机
process.on("uncaughtError", async function(){
    task.type = "bigVError";
    process.send(task);
    process.exit(0);
})

process.on("exit", function(){
    task.type = "error";
    console.log("exit之前执行一下");
    process.send(task);
})

process.on("message", async function (e) {
    task  = e;
    switch (e.name) {
        case "user": {
            if(false){
                console.log("debugING");
                console.log("跳过登录");
                process.send({
                    type: "login"
                })
            }else{
                await openIndex(e.user);
            }
            break;
        }
        case "weibo_keyword": {
            console.log("puppeteer收到关键词任务");
            await searchKeyword();
            break;
        }
        case "weibo_bigv": {
            if(task.page){
                console.log("puppeteer收到微博大v任务");
                await searchBigVName();
                break;
            }else{
                console.log("puppeteer初始化微博大v任务");
                await initBigVName();
                break;
            }
        }
        case "weibo_update_everyday": {
            console.log("puppeteer收到微博首页更新任务");
            await updateEveryDay();
            break;
        }
        case "weibo_bigv_all": {
            if(task.page){
                console.log("puppeteer收到微博大v全部任务");
                await searchAllBigVName();
                break;
            }else{
                console.log("puppeteer初始化微博大v全部任务");
                await initAllBigVName();
                break;
            }
        }
    }
})
//需要worker

//启动puppeteer
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
    process.send({
        type: "launched"
    })
};

//登陆
const openIndex = async (user) => {
    log("开始登陆");
    try{
        await pages[0].waitForFunction("document.querySelector('title').innerHTML.indexOf('我的首页')>=0");
        log("登录成功");
        process.send({
            type: "login"
        })
        return;
    }catch (e){

    }

    try {
        await pages[0].waitForSelector("input[name=username]");
    } catch (e) {
        console.log("打开主页失败，正在重试");
        await pages[0].reload();
        await sleep();
        await openIndex(pages[0]);
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
    process.send({
        type: "login"
    })
};

//关键词搜索
const searchKeyword = async () => {
    try {
        await pages[0].goto(`http://s.weibo.com/weibo/${encodeURIComponent(task.value)}&Refer=index`);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        console.log(e);
        await sleep();
        await searchKeyword();
        return;
    }

    let noresult = await pages[0].evaluate(() => {
        if(document.querySelector(".search_noresult")) return true;
        return false;
    })

    if(noresult){
        task.type = "error";
        process.send(task);
        return;
    }

    //向下滚动
    await pages[0].evaluate(() => {
        let interval = setInterval(function () {
            //这里增加了翻页速度 50 -> 100
            window.scrollTo(0, document.documentElement.scrollTop + 50);
            if (document.querySelector(".page.next.S_txt1.S_line1")) {
                clearInterval(interval);
            }
        }, 50)
    });

    try {
        await pages[0].waitForSelector(".page.next.S_txt1.S_line1", {timeout: 30000});
        console.log("加载底部翻页按钮成功");
    } catch (e) {
        console.log("加载底部翻页按钮失败，正在重试");
        await pages[0].reload();
        await sleep(60);
        await searchKeyword();
        return;
    }

    let blogNodes = await pages[0].$$("div[action-type=feed_list_item]:not([isforward='1'])")

    let count = 0;
    for (let i = 0; i < blogNodes.length; i++) {
        let item = blogNodes[i];
        let commentBtn = await item.$("[action-type=feed_list_comment]");
        await commentBtn.click();
        try {
            await pages[0].waitForFunction("document." +
                "querySelectorAll(\"div.WB_feed_like p.text" +
                " i.W_loading:not([style='display:none;'])\").length" +
                " == 0"
                , {timeout: 10000});
        } catch (e) {
            await sleep();
            let ok = await pages[0].$("a[node-type=ok]");
            if (ok) {
                await ok.click();
            }
            await sleep(2);
            await commentBtn.click();
            log("评论" + count + "加载失败，正在重试");
            if (errTime === 10) {
                log("出错超过十次！");
                process.send({
                    type: "error",
                    name: name,
                    value: keyword,
                    taskId: taskId,
                })
                return;
            }
            errTime++;
            i--;
            count--;
            continue;
        }
        errTime = 0;
        await sleep(1);
    }


    //点开所有点开全文 并删除点开全文/收起全文按钮
    for(let i = 0;i< blogNodes.length;i++){
        let openButton = blogNodes[i];
        try{
            let button = await openButton.$$(".WB_text_opt");
            if(button && button[0]) {
                button = button[0]
                await button.click()
            };
            button = await openButton.$$(".WB_text_opt");
            if(button && button[0]) {
                button = button[0]
                await button.click()
            };
        }catch(e){
            console.log(e);
        }
    }

    await pages[0].evaluate(() => {
        let buttons = document.querySelectorAll(".WB_text_opt");
        for(let button of buttons){
            button.remove();
        }
    })

    //收集信息
    let pageResult = await pages[0].evaluate(() => {
        var blogNodes = document.querySelectorAll("div[action-type=feed_list_item]:not([isforward='1'])");
        var result = []
        for(var blogNode of blogNodes){
            var TemplateData = {
                source: "",
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
                if(blogNode.querySelector(str)){
                    let result = parseInt(blogNode.querySelector(str).innerText.trim());
                    if(result === null){
                        return 0
                    }
                    return result;
                }else{
                    return 0;
                }
            }
            TemplateData.transmieCount = existAndReturn("[action-type=feed_list_forward] .line.S_line1 em");
            TemplateData.commentCount = existAndReturn("[action-type=feed_list_comment] .line.S_line1 em");
            TemplateData.agreeCount = existAndReturn("[action-type=feed_list_like] .line.S_line1 em");

            try{
                let created_at = new Date(blogNode.querySelector(".feed_list_item_date em").innerText);
                if(created_at == "Invalid Date"){
                    throw new Error("时间格式不对");
                }else{
                    TemplateData.created_at = created_at.getTime();
                }
            }catch(e){
                TemplateData.created_at = new Date().getTime();
            }

            if(blogNode.querySelector(".comment_txt[node-type=feed_list_content_full]")){
                TemplateData.title = blogNode.querySelector(".comment_txt[node-type=feed_list_content_full]").innerText;
            }else if(blogNode.querySelector(".comment_txt[node-type=feed_list_content]")){
                TemplateData.title = blogNode.querySelector(".comment_txt[node-type=feed_list_content]").innerText;
            }
            TemplateData.source =  blogNode.querySelector(".feed_content.wbcon .W_texta.W_fb").getAttribute("title");
            TemplateData.detailUrl = "http:" + blogNode.querySelector(".W_textb [node-type=feed_list_item_date]").getAttribute("href");

            //comment
            var comments = blogNode.querySelectorAll("[node-type=feed_list_commentList] dl .WB_text");
            for(var comment of comments){
                TemplateData.comments.push(comment.innerText);
            }
            //img
            var imgs= blogNode.querySelectorAll(".WB_pic.S_bg2.bigcursor img");
            for(var img of imgs){
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
            if(blogNode.querySelector(".media_box_video_1")){
                var video = blogNode.querySelector(".media_box_video_1");
                TemplateData.video.cover_img.src = "http:" + video.querySelector(".con-1.hv-pos img").getAttribute("src");
                TemplateData.video.cover_img.width = video.querySelector(".con-1.hv-pos img").naturalWidth;
                TemplateData.video.cover_img.height = video.querySelector(".con-1.hv-pos img").naturalHeight;
                TemplateData.video.src = video.querySelector("video").getAttribute("src");
            }

            result.push(TemplateData);
        }

        return result;
    })

    task.type = "success";
    task.datas = pageResult;
    process.send(task);
}

//大v历史搜索
const searchBigVName = async () => {

    let currentUrl = task.currentUrl;

    const main = async (curPage) => {
        curPage.goto(currentUrl);
        try {
            await curPage.waitForSelector("div.WB_frame_c");
        } catch (e) {
            console.log("博主页面加载失败，正在重试");
            await curPage.reload();
            await sleep();
            main(curPage);
            return;
        }
        log("进入博主 " + await curPage.title());

        await sleep(1);

        currentUrl = await curPage.evaluate(() => {
            return window.location.href;
        });

        //检测并跳转到原创页
        if (currentUrl.indexOf("is_ori=1") < 0) {
            console.log(currentUrl);
            console.log("此页非原创页面");
            currentUrl = currentUrl.substr(0, currentUrl.indexOf("?") + 1);
            currentUrl += "is_ori=1";
            console.log(currentUrl);
            try {
                await curPage.goto(currentUrl);
            } catch (e) {

            }
            console.log(currentUrl);
            await sleep();
            main(curPage);
            return;
        }



        //点开所有评论 展现全部页面
        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 50);
                if (document.querySelector("div.W_pages a[bpfilter=page]")) {
                    clearInterval(interval);
                }
            }, 50)
        });
        try {
            await curPage.waitForSelector("div.W_pages a[bpfilter=page]", {timeout: 30000});
        } catch (e) {
            console.log("加载底部翻页按钮失败，正在重试");
            await curPage.reload();
            await sleep(60);
            main(curPage);
            return;
        }
        let blogNodes = await curPage.$$("div[action-type=feed_list_item]");
        let count = 0;
        for (let i = 0; i < blogNodes.length; i++) {
            let item = blogNodes[i];
            let commentBtn = await item.$("a[action-type=fl_comment]");
            await commentBtn.click();
            try {
                await curPage.waitForFunction("document." +
                    "querySelectorAll(\"div.WB_feed_like p.text" +
                    " i.W_loading:not([style='display:none;'])\").length" +
                    " == 0"
                    , {timeout: 10000});
            } catch (e) {
                await sleep();
                let ok = await curPage.$("a[node-type=ok]");
                if (ok) {
                    await ok.click();
                }
                await sleep(2);
                await commentBtn.click();
                log("评论" + count + "加载失败，正在重试");
                if (errTime === 20) {
                    log("出错超过20次！");
                    process.exit(0);
                    return;
                }
                errTime++;
                i--;
                count--;
                continue;
            }
            errTime = 0;
            await sleep(1);
        }

        let pageResult = await curPage.evaluate(function(){
            var blogNodes = document.querySelectorAll("div[action-type=feed_list_item]:not([isforward='1'])");
            var result = []
            for(var blogNode of blogNodes){
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
                    if(blogNode.querySelectorAll(str)[1]){
                        let result = parseInt(blogNode.querySelectorAll(str)[1].innerText.trim());
                        if(result === null){
                            return 0
                        }
                        return result;
                    }else{
                        return 0;
                    }
                }
                TemplateData.transmieCount = existAndReturn("[action-type=fl_forward] .line.S_line1 em");
                TemplateData.commentCount = existAndReturn("[action-type=fl_comment] .line.S_line1 em");
                TemplateData.agreeCount = existAndReturn("[action-type=fl_like] .line.S_line1 em");

                try{
                    let created_at = new Date(blogNode.querySelector(".feed_list_item_date em").innerText);
                    if(created_at == "Invalid Date"){
                        throw new Error("时间格式不对");
                    }else{
                        TemplateData.created_at = created_at.getTime();
                    }
                }catch(e){
                    TemplateData.created_at = new Date().getTime();
                }

                if(blogNode.querySelector("[node-type=feed_list_content_full]")){
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content_full]").innerText;
                }else if(blogNode.querySelector("[node-type=feed_list_content]")){
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content]").innerText;
                }
                TemplateData.detailUrl = "http:" + blogNode.querySelector("[node-type=feed_list_item_date]").getAttribute("href");

                //comment
                //todo 这里为了拿到博主回复可能还需要再修改
                let splits = blogNode.querySelectorAll("[node-type=feed_list_commentList] .list_con[node-type=replywrap]");
                for(let split of splits){
                    TemplateData.comments.push(split.querySelector(".WB_text").innerText);
                }

                //img
                var imgs= blogNode.querySelectorAll(".WB_pic.S_bg2.bigcursor img");
                for(var img of imgs){
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
                if(blogNode.querySelector(".media_box_video_1")){
                    var video = blogNode.querySelector(".media_box_video_1");
                    TemplateData.video.cover_img.src = "http:" + video.querySelector(".con-1.hv-pos img").getAttribute("src");
                    TemplateData.video.cover_img.width = video.querySelector(".con-1.hv-pos img").naturalWidth;
                    TemplateData.video.cover_img.height = video.querySelector(".con-1.hv-pos img").naturalHeight;
                    TemplateData.video.src = video.querySelector("video").getAttribute("src");
                }

                result.push(TemplateData);
            }

            return result;
        })

        let allPageCount = task.pageCount;
        let findInHref = (key, str) => {
            let  hrefToJson = (str) => {
                let json = {};
                let arr = str.split("?")[1].split("&");
                for(let part of arr){
                    json[part.split("=")[0]] = part.split("=")[1];
                }
                return json;
            }
            let json = hrefToJson(str);
            for(let keyWord in json){
                if(keyWord === key){
                    return json[keyWord];
                }
            }
            return null;
        }
        let currentPageCount = task.page;
        console.log(currentPageCount, allPageCount, "为什么直接就true了？")
        if(currentPageCount > allPageCount - PUPPERTTER_LIMIT){
            task.end = true;
        }else{
            task.end = false;
        }
        task.type = "success";
        task.datas = pageResult;
        process.send(task);

    };

    try {
        await pages[0].goto(`http://s.weibo.com/user/${encodeURIComponent(task.value)}&Refer=focus_lx_STopic_box`);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        await sleep();
        return;
    }

    await sleep();

    const name = await pages[0].$("p.person_name a");
    await name.click();
    let curPage;
    let check = async () => {
        let Pages = await browser.pages();
        if (Pages.length === 2) {
            await sleep(0.1);
            await check();
        } else {
            pages[0] = Pages[2];
            await Pages[1].close();
            if(debug){
                if(task.page === 2){
                    task.end = true;
                }else{
                    task.end = false;
                }
                task.type = "success";
                task.datas = {
                    debug: true,
                    detailUrl: "https://www.baidu.com"
                };
                process.send(task);
            }else{
                await main(pages[0]);
            }
        }
    };
    await check();
}

//大v历史搜索初始化
const initBigVName = async () => {

    console.log("开始大v历史搜索初始化");

    let currentUrl = `http://s.weibo.com/user/${encodeURIComponent(task.value)}&Refer=focus_lx_STopic_box`;

    const main = async (curPage) => {
        try {
            await curPage.waitForSelector("div.WB_frame_c");
        } catch (e) {
            console.log("博主页面加载失败，正在重试");
            await curPage.reload();
            await sleep();
            main(curPage);
            return;
        }
        log("进入博主 " + await curPage.title());

        await sleep(1);

        currentUrl = await curPage.evaluate(() => {
            return window.location.href;
        });

        //检测并跳转到原创页
        if (currentUrl.indexOf("is_ori=1") < 0) {
            currentUrl = currentUrl.substr(0, currentUrl.indexOf("?") + 1);
            currentUrl += "is_ori=1";
            try {
                await curPage.goto(currentUrl);
            } catch (e) {

            }
            await sleep();
            main(curPage);
            return;
        }

        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 50);
                if (document.querySelector("div.W_pages a[bpfilter=page]")) {
                    clearInterval(interval);
                }
            }, 50)
        });
        try {
            await curPage.waitForSelector("div.W_pages a[bpfilter=page]", {timeout: 30000});
        } catch (e) {
            console.log("加载底部翻页按钮失败，正在重试");
            await curPage.reload();
            await sleep(60);
            main(curPage);
            return;
        }
        log("已滚动到页面底部");

        let allPageCount = await curPage.evaluate(function(){
            let str = document.querySelector("[action-type=feed_list_page_more]").getAttribute("action-data");
            let pageCount = parseInt(str.split("&")[1].split("=")[1]);
            return pageCount;
        });
        let findInHref = (key, str) => {
            let  hrefToJson = (str) => {
                let json = {};
                let arr = str.split("?")[1].split("&");
                for(let part of arr){
                    json[part.split("=")[0]] = part.split("=")[1];
                }
                return json;
            }
            let json = hrefToJson(str);
            for(let keyWord in json){
                if(keyWord === key){
                    return json[keyWord];
                }
            }
            return null;
        }

        let currentPageCount = parseInt(findInHref("page", currentUrl));
        if(currentPageCount === allPageCount){
            task.end = true;
        }else{
            task.end = false;
        }
        task.type = "bigVInit";
        task.pageCount = allPageCount;
        task.baseUrl = currentUrl.split("?")[0] + "?is_ori=1";
        process.send(task);

    };

    try {
        await pages[0].goto(currentUrl);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        await sleep();
        return;
    }

    log("搜索对应微博账号");
    await sleep();

    const name = await pages[0].$("p.person_name a");
    await name.click();
    let check = async () => {
        let Pages = await browser.pages();
        if (Pages.length === 2) {
            await sleep(0.1);
            await check();
        } else {
            pages[0] = Pages[2];
            await Pages[1].close();
            if(debug){
                task.type = "bigVInit";
                task.pageCount = 2;
                task.baseUrl = "https://weibo.com/u/6049590367" + "?is_ori=1";
                process.send(task);
            }else{
                await main(pages[0]);
            }
        }
    };
    await check();
}

//大v全部历史搜索
const searchAllBigVName = async () => {

    let currentUrl = task.currentUrl;

    const main = async (curPage) => {
        curPage.goto(currentUrl);
        try {
            await curPage.waitForSelector("div.WB_frame_c", {timeout: 60000});
        } catch (e) {
            console.log("博主页面加载失败，正在重试");
            await curPage.reload();
            await sleep();
            main(curPage);
            return;
        }
        log("进入博主 " + await curPage.title());

        await sleep(1);

        currentUrl = curPage.url();

        //检测并跳转到全部页
        if (currentUrl.indexOf("is_all=1") < 0) {
            console.log("此页非全部页面");
            currentUrl = currentUrl.substr(0, currentUrl.indexOf("?") + 1);
            currentUrl += "is_all=1";
            try {
                await curPage.goto(currentUrl);
            } catch (e) {

            }
            await sleep();
            main(curPage);
            return;
        }

        //点开所有评论 展现全部页面
        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 50);
                if (document.querySelector("div.W_pages a[bpfilter=page]")) {
                    clearInterval(interval);
                }
            }, 50)
        });
        try {
            await curPage.waitForSelector("div.W_pages a[bpfilter=page]", {timeout: 60000});
        }
        catch (e) {
            console.log("加载底部翻页按钮失败，正在重试");
            await curPage.reload();
            await sleep(10);
            main(curPage);
            return;
        }
        let blogNodes = await curPage.$$("div[action-type=feed_list_item]");
        let count = 0;
        for (let i = 0; i < blogNodes.length; i++) {
            let item = blogNodes[i];
            let commentBtn = await item.$("a[action-type=fl_comment]");
            await commentBtn.click();
            try {
                await curPage.waitForFunction("document." +
                    "querySelectorAll(\"div.WB_feed_like p.text" +
                    " i.W_loading:not([style='display:none;'])\").length" +
                    " == 0"
                    , {timeout: 10000});
            } catch (e) {
                await sleep();
                let ok = await curPage.$("a[node-type=ok]");
                if (ok) {
                    await ok.click();
                }
                await sleep(2);
                await commentBtn.click();
                log("评论" + count + "加载失败，正在重试");
                if (errTime === 20) {
                    log("出错超过20次！");
                    process.exit(0);
                    return;
                }
                errTime++;
                i--;
                count--;
                continue;
            }
            errTime = 0;
            await sleep(1);
        }

        let pageResult = await curPage.evaluate(function(){

            var blogNodes = document.querySelectorAll("div[action-type=feed_list_item]");
            var result = []
            for(var blogNode of blogNodes){

                blockNode = blogNode;
                let existAndReturn = (str) => {
                    if(blogNode.querySelectorAll(str)[1]){
                        let result = parseInt(blogNode.querySelectorAll(str)[1].innerText.trim());
                        if(result === null){
                            return 0
                        }
                        return result;
                    }else{
                        return 0;
                    }
                }

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

                if(blogNode.getAttribute("isforward")){

                    var expandNode = blogNode.querySelector(".WB_expand");

                    console.log("为转发内容");
                    TemplateData.forward = {
                        title: "",
                        transmieCount: 0,
                        commentCount: 0,
                        agreeCount: 0,
                        created_at: "",
                        imgs: [],
                        video: {
                            src: "",
                            cover_img: {
                                src: "",
                                width: 0,
                                height: 0
                            }
                        },
                        detailUrl: "",
                        source: ""
                    }
                    TemplateData.forward.title = expandNode.querySelector(".WB_text[node-type=feed_list_reason]").innerText;

                    var handles = expandNode.querySelectorAll(".WB_handle.W_fr li");

                    TemplateData.forward.transmieCount = handles[0].innerText;
                    TemplateData.forward.commentCount = handles[1].innerText;
                    TemplateData.forward.agreeCount = handles[2].innerText;
                    TemplateData.forward.created_at = expandNode.querySelector(".WB_from.S_txt2 a").getAttribute("date")

                    var imgs = expandNode.querySelectorAll(".media_box img");
                    for(let img of imgs){
                        TemplateData.forward.imgs.push({
                            src: img.getAttribute("src"),
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        })
                    }

                    var video = expandNode.querySelector(".WB_h5video");
                    if(video){
                        TemplateData.forward.video.src = expandNode.querySelector(".WB_h5video video").getAttribute("src");
                        TemplateData.forward.video.cover_img.src = expandNode.querySelector(".con-1 img").getAttribute("src");
                        TemplateData.forward.video.cover_img.width = expandNode.querySelector(".con-1 img").naturalWidth;
                        TemplateData.forward.video.cover_img.height = expandNode.querySelector(".con-1 img").naturalHeight;
                    }

                    TemplateData.forward.detailUrl = "https://weibo.com" +  expandNode.querySelector(".WB_from.S_txt2 a").getAttribute("href");
                    TemplateData.forward.source = expandNode.querySelector(".W_fb.S_txt1").getAttribute("title")
                }

                TemplateData.transmieCount = existAndReturn("[action-type=fl_forward] .line.S_line1 em");
                TemplateData.commentCount = existAndReturn("[action-type=fl_comment] .line.S_line1 em");
                TemplateData.agreeCount = existAndReturn("[action-type=fl_like] .line.S_line1 em");

                TemplateData.created_at = blogNode.querySelector(".WB_from.S_txt2 a").getAttribute("date");


                if(blogNode.querySelector("[node-type=feed_list_content_full]")){
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content_full]").innerText;
                }else if(blogNode.querySelector("[node-type=feed_list_content]")){
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content]").innerText;
                }
                TemplateData.detailUrl = "https://weibo.com" + blogNode.querySelector("[node-type=feed_list_item_date]").getAttribute("href");

                //comment
                var root_comments = blogNode.querySelectorAll("[node-type=root_comment]");
                for(var root_comment of root_comments){
                    let commentsArr = [];
                    let comments = root_comment.querySelectorAll(".WB_text");
                    for(let comment of comments){
                        commentsArr.push(comment.innerText);
                    }
                    TemplateData.comments.push(commentsArr);
                }

                //img
                var imgs= blogNode.querySelectorAll(".media_box img");
                for(var img of imgs){
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
                var video = blogNode.querySelector(".WB_h5video");
                if(video){
                    TemplateData.video.src = blogNode.querySelector(".con-2 video").getAttribute("src");
                    TemplateData.video.cover_img.src = blogNode.querySelector(".con-1 img").getAttribute("src");
                    TemplateData.video.cover_img.width = blogNode.querySelector(".con-1 img").naturalWidth;
                    TemplateData.video.cover_img.height = blogNode.querySelector(".con-1 img").naturalHeight;

                    TemplateData.imgs = [];
                }

                result.push(TemplateData);
            }

            return result;
        })

        let allPageCount = task.pageCount;
        let currentPageCount = task.page;

        File.appendFileSync("result.txt", JSON.stringify(pageResult) + "\n");

        if(currentPageCount > allPageCount - PUPPERTTER_LIMIT){
            task.end = true;
        }else{
            task.end = false;
        }

        task.type = "success";
        task.datas = pageResult;
        process.send(task);

    };

    try {
        await pages[0].goto(`http://s.weibo.com/user/${encodeURIComponent(task.value)}&Refer=focus_lx_STopic_box`);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        await sleep();
        return;
    }

    await sleep();

    const name = await pages[0].$("p.person_name a");
    await name.click();
    let curPage;
    let check = async () => {
        let Pages = await browser.pages();
        if (Pages.length === 2) {
            await sleep(0.1);
            await check();
        } else {
            pages[0] = Pages[2];
            await Pages[1].close();
            if(debug){
                if(task.page === 2){
                    task.end = true;
                }else{
                    task.end = false;
                }
                task.type = "success";
                task.datas = {
                    debug: true,
                    detailUrl: "https://www.baidu.com"
                };
                process.send(task);
            }else{
                await main(pages[0]);
            }
        }
    };
    await check();
}

//大v全部历史搜索初始化
const initAllBigVName = async () => {

    console.log("开始大v全部历史搜索初始化");

    let currentUrl = `http://s.weibo.com/user/${encodeURIComponent(task.value)}&Refer=focus_lx_STopic_box`;

    const main = async (curPage) => {
        try {
            await curPage.waitForSelector("div.WB_frame_c");
        } catch (e) {
            console.log("博主页面加载失败，正在重试");
            await curPage.reload();
            await sleep();
            main(curPage);
            return;
        }
        log("进入博主 " + await curPage.title());

        await sleep(1);

        currentUrl = await curPage.evaluate(() => {
            return window.location.href;
        });

        //检测并跳转到全部页
        if (currentUrl.indexOf("is_all=1") < 0) {
            currentUrl = currentUrl.substr(0, currentUrl.indexOf("?") + 1);
            currentUrl += "is_all=1";
            try {
                await curPage.goto(currentUrl);
            } catch (e) {

            }
            await sleep();
            main(curPage);
            return;
        }

        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 50);
                if (document.querySelector("div.W_pages a[bpfilter=page]")) {
                    clearInterval(interval);
                }
            }, 50)
        });
        try {
            await curPage.waitForSelector("div.W_pages a[bpfilter=page]", {timeout: 30000});
        } catch (e) {
            console.log("加载底部翻页按钮失败，正在重试");
            await curPage.reload();
            await sleep(60);
            main(curPage);
            return;
        }
        log("已滚动到页面底部");

        let allPageCount = await curPage.evaluate(function(){
            let str = document.querySelector("[action-type=feed_list_page_more]").getAttribute("action-data");
            let pageCount = parseInt(str.split("&")[1].split("=")[1]);
            return pageCount;
        });
        let findInHref = (key, str) => {
            let  hrefToJson = (str) => {
                let json = {};
                let arr = str.split("?")[1].split("&");
                for(let part of arr){
                    json[part.split("=")[0]] = part.split("=")[1];
                }
                return json;
            }
            let json = hrefToJson(str);
            for(let keyWord in json){
                if(keyWord === key){
                    return json[keyWord];
                }
            }
            return null;
        }

        let currentPageCount = parseInt(findInHref("page", currentUrl));
        if(currentPageCount === allPageCount){
            task.end = true;
        }else{
            task.end = false;
        }
        task.type = "bigVAllInit";
        task.pageCount = allPageCount;
        task.baseUrl = currentUrl.split("?")[0] + "?is_all=1";
        process.send(task);

    };

    try {
        await pages[0].goto(currentUrl);
    } catch (e) {
        console.log("搜索页面打开失败，正在重试！");
        await sleep();
        return;
    }

    log("搜索对应微博账号");
    await sleep();

    const name = await pages[0].$("p.person_name a");
    await name.click();
    let check = async () => {
        let Pages = await browser.pages();
        if (Pages.length === 2) {
            await sleep(0.1);
            await check();
        } else {
            pages[0] = Pages[2];
            await Pages[1].close();
            if(debug){
                task.type = "bigVAllInit";
                task.pageCount = 2;
                task.baseUrl = "https://weibo.com/u/6049590367" + "?is_all=1";
                process.send(task);
            }else{
                await main(pages[0]);
            }
        }
    };
    await check();
}

//微博每日更新
const updateEveryDay = async () => {

}

launchBrowser();