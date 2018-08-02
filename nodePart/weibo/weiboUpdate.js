const Http = require("../api/http").Http;
const puppeteer = require('puppeteer');
const log = function(d){
    console.log(d)
}
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const BEE_NAME = "weibo_update_everyday";
let dataTemp = [];
let alreadyPost = new Set();
let brick_id = "";
let usr = {};
let pages = [void 0, void 0];
process.on('uncaughtException', (err) => {
    console.log("捕获到异常 而且不想管他", err);
});

const filterItem = async (value) => {
    let query = {
        partition: "weibo",
        keys: [value]
    };
    let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
    console.log(res);
    res = JSON.parse(res);
    return res.result.filter_result[0];
};

const postDataToDereplicate = async (value) => {
    let query = {
        partition: "weibo",
        key: value
    };
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
};

const zhandui = [{
    username: "15351702865",//我
    password: "cqcp815"
},{
    username: "17132139207",//语无伦次的人 g
    password: "washu123456"
},{
    username: "17132136531",//小小的帽 gggg
    password: "washu123456"
},{
    username: "17132192044",//古月胡的朋友 g
    password: "washu123456"
},{
    username: "17132132502",//木卡卡西的朋友 g
    password: "washu123456"
}]
const modifyURL = async () => {
    console.log(await pages[0].url());
    let hostURL = await pages[0].url().split("?")[0];
    return hostURL + "?is_ori=1#_0";
}
const getBrickId = async() => {
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
    for(let da of data){
        if(da.name == trueName){
            return da.id;
        }
    }

    return false;
}
const postWashTask = async (data) => {
    let washTask = {
        name: "wash_corpus",
        value: "",
        config: JSON.stringify({
            bee_source: BEE_NAME,
            brick_id: brick_id,
            publish: false
        }),
        data: JSON.stringify(data),
        scheduled_at: Date.now()
    };
    let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
    return d.id;
};
const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
        timeout: 0,
        devtools: false
    });

    pages[0] = await browser.newPage();
    await pages[0].setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko)" +
        " Chrome/62.0.3202.75 Safari/537.36");
    await pages[0].setViewport({
        width: 1920,
        height: 1080,
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

const openIndex = async (user) => {
    log("开始登陆");
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

    let url = await modifyURL();
    console.log("发现了新的轨道为 ", url);
    await pages[0].goto(url);
    log("不仅登录成功了 我还切换了火车轨道");
};
//return the last five data
const onePage =async (curPage) => {
    try{


        console.log("开始操作 准备展现全部页面");
        //展现全部页面
        await curPage.evaluate(() => {
            let interval = setInterval(function () {
                window.scrollTo(0, document.documentElement.scrollTop + 50);
                if (document.querySelector("[action-type=feed_list_page]")) {
                    clearInterval(interval);
                }
                try{
                    document.querySelector(".empty_con a").click();
                }catch(e){
                    console.log(e);
                }

            }, 50)
        });

        await curPage.waitForSelector("[action-type=feed_list_page]", {timeoutL: 60000});

        console.log("点开最后五个");
        //点开最后五个
        let blogNodes = await curPage.$$("div[action-type=feed_list_item]");
        blogNodes.reverse();
        for (let i = 0; i < 5; i++) {
            let item = blogNodes[i];
            let commentBtn = await item.$("a[action-type=fl_comment]");
            await commentBtn.click();
            //log("点开评论" + ++count);
            try {
                await curPage.waitForFunction("document." +
                    "querySelectorAll(\"div.WB_feed_like p.text" +
                    " i.W_loading:not([style='display:none;'])\").length" +
                    " == 0"
                    , {timeout: 10000});
            } catch (e) {
                console.log("点开评论的时候报的错");
                console.log(e);
            }
        }

        //获取数据
        let pageResult = await curPage.evaluate(() => {
            var ads = document.querySelectorAll("[feedtype=ad]")
            for(let a of ads){
                a.remove();
            }

            var blogNodes = document.querySelectorAll("div[action-type=feed_list_item]");
            var result = []
            for (var blogNode of blogNodes) {
                var TemplateData = {
                    source: "关注博主每日更新",
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
                    if (blogNode.querySelector(str)) {
                        let result = parseInt(blogNode.querySelector(str).innerText.trim());
                        if (result === null) {
                            return 0
                        }
                        return result;
                    } else {
                        return 0;
                    }
                }
                TemplateData.transmieCount = parseInt(blogNode.querySelector("[node-type=forward_btn_text]").innerText.substr(1))
                TemplateData.commentCount = parseInt(blogNode.querySelector("[node-type=comment_btn_text]").innerText.substr(1))
                TemplateData.agreeCount = parseInt(blogNode.querySelector("[node-type=like_status]").innerText.substr(1))

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
                TemplateData.detailUrl = "http://weibo.com" + blogNode.querySelector("[node-type=feed_list_item_date]").getAttribute("href");

                //comment
                var comments = blogNode.querySelectorAll("[node-type=feed_list_commentList] .WB_text");
                for (var comment of comments) {
                    let re = "";
                    let text = comment.innerText.split("：");
                    for(let i = 1;i< text.length;i++){
                        re = re + text[i];
                    }
                    TemplateData.comments.push(re);
                }
                //img
                var imgs = blogNode.querySelectorAll(".WB_media_a img");
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
                console.log(TemplateData.comments)
                if(blogNode.querySelector("video")){
                    console.log("有视频的")
                    TemplateData.video.src = blogNode.querySelector("video").getAttribute("src");
                    let img = blogNode.querySelector(".WB_media_a img");
                    TemplateData.video.cover_img.src = "http:" + img.getAttribute("src");
                    TemplateData.video.cover_img.width = img.naturalWidth;
                    TemplateData.video.cover_img.height = img.naturalHeight;
                    TemplateData.imgs = [];
                }else{
                    console.log("没视频的")
                }

                //content
                if (blogNode.querySelector("[node-type=feed_list_content]")) {
                    try{
                        let ss =bolgNode.querySelectorAll("a");
                        for(let s of ss){
                            s.remove();
                        }
                    }catch(e){}
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content]").innerText;
                } else if (blogNode.querySelector(".comment_txt[node-type=feed_list_content]")) {
                    TemplateData.title = blogNode.querySelector("[node-type=feed_list_content]").innerText;
                }
                TemplateData.title = TemplateData.title.replace("秒拍视频", "视频");
                result.push(TemplateData);
            }
            console.log(result);
            return result;
        })
        let result = [];
        for(let i=0;i< 5;i++){
            let data = pageResult.pop();
            let indata = {
                id: data.detailUrl,
                data: data
            }
            result.push(indata);
        }

        return result;
    }catch(e){
        console.log(e)
        return false;
    }
}

let first = true;
(async () => {
    const run = async () => {
        console.log("======================== 没有出错的可能 ========================");

        try {
            brick_id = await getBrickId();
            console.log("当前去往的终点brick_id为 ", brick_id);
            if(!first){
                try{
                    await pages[0].reload();
                }catch(e){
                    throw new Error(e);
                }
                console.log("页面刷新一下");
            }else{
                first = false;
            }
            let data = await onePage(pages[0]);
            console.log("我拿下来的又是个啥");
            for(let ww of data){
                console.log(JSON.stringify(ww));
            }
            if(!data){
                console.log("ONE Page 失败掉了 还是蛮烦的");
                await sleep(20);
                await run();
                return ;
            }
            const solve = async() =>{
                let dataIDs = new Set();
                for(let da of data){
                    dataIDs.add(da.id);
                }
                const addComment = async (id) => {
                    let q = {};
                    let p = {};
                    for(let da of data){
                        if(da.id == id){
                            q = da.data
                            break;
                        }
                    }
                    for(let da of dataTemp){
                        if(da.id == id){
                            p = da.data
                            break;
                        }
                    }
                    let ps = new Set();
                    for(let pp of p.comments){
                        ps.add(pp);
                    }
                    for(let qq of q.comments){
                        if(!ps.has(qq)){
                            p.comments.push(qq);
                        }
                    }
                    return p;
                }

                for(let i=0;i< dataTemp.length;i++){
                    if(!dataIDs.has(dataTemp[i].id)){
                        if(!alreadyPost.has(dataTemp[i].id)){
                            if(dataTemp[i].data.comments.length > -1){
                                let value = dataTemp[i].id.split("?")[0];
                                let filiter = await filterItem(value);
                                if(!filiter){
                                    console.log("已经有了这个数据了 别搞我啊");
                                }else{
                                    console.log("我扔上去的到底是个嘛？", dataTemp[i].data.video.src);
                                    console.log("我扔上去的到底是个嘛？", JSON.stringify(dataTemp[i].data));
                                    await postWashTask(dataTemp[i].data);
                                    await postDataToDereplicate(value);
                                    console.log("成功提交数据", dataTemp[i].data.title);
                                }
                            }
                            alreadyPost.add(dataTemp[i].id);
                        }
                        delete dataTemp[i];
                    }else{
                        for(let da of data){
                            if(da.id == dataTemp[i].id){
                                dataTemp[i].data = addComment(dataTemp[i].id);
                                break;
                            }
                        }
                    }
                }

                for(let d of data){
                    let has = false;
                    for(let dt of dataTemp){
                        if(dt && d && dt.id == d.id){
                            has = true;
                            break;
                        }
                    }
                    if(!has) dataTemp.push(d);
                }
                let  dataTempTemp = [];
                for(let d of dataTemp){
                    if(d){
                        dataTempTemp.push(d);
                    }
                }
                dataTemp = dataTempTemp;
                return ;
            }
            await solve();
            console.log("solve成功了");

            await sleep(20);
            await run();
        } catch (e) {
            console.log(e, "run Error");
            await run();
        }
    };
    if(!process.argv[2]){
        console.log("需要 参数 1-5");
    }else{
        usr = zhandui[parseInt(process.argv[2]) - 1];
        console.log("使用的账号为",usr);
        await launchBrowser();
        await openIndex(usr);
        await run();
    }
})()