require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});

require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../service/tab",
    "../api/fileControll",
], (Config, Http, Async, Task, Socket, Tab, SaveFile, FileControll) => {

    const getRequest = (url) => {
        if (url.indexOf("/") === url.length - 1) {
            url = url.substring(0, url.length - 1);
        }
        let request = {};
        if (url.indexOf("?") !== -1) {
            let str = url.substr(1);
            let strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {
                request[strs[i].split("=")[0]] = strs[i].split("=")[1];
            }
        }
        return request;
    };

    const extractWebUrl = (legoR) => {
        let parts = legoR.split("||");
        for (let part of parts) {
            try {
                let model = JSON.parse(part);
                if (model.source.indexOf("www.bilibili.com") >= 0) {
                    let avcode = model.source.substring(model.source.indexOf("www.bilibili.com/video/") + "www.bilibili.com/video/".length);
                    avcode = avcode.split("/")[0];
                    let cutLength = avcode[avcode.length - 1] == "/" ? 1 : 0;
                    let mobileSource = "https://m.bilibili.com/video/" + avcode.substring(0, avcode.length - cutLength) + ".html";
                    return {
                        type: "bilibili",
                        source: model.source,
                        mobileSource: mobileSource
                    };
                } else if (model.source.indexOf("www.pearvideo.com") >= 0) {
                    return {
                        type: "pearvideo",
                        source: model.source,
                        mobileSource: model.source
                    }
                } else if (model.source.indexOf("ixiaochuan") >= 0 || model.source.indexOf("izuiyou") >= 0) {
                    return {
                        type: "zuiyou",
                        source: model.source,
                        mobileSource: model.source
                    }
                } else {
                    return {
                        type: null,
                        source: model.source,
                        mobileSource: model.source
                    }
                }
            } catch (err) { }
        }
        return {
            type: null,
            source: null,
            mobileSource: null
        };
    };

    const runBilibiliTask = async(task, webUrl, mobileWebUrl) => {
        Socket.log("打开Bilibili网页web_url=", mobileWebUrl);
        let tab = new Tab(mobileWebUrl, ["./business/script_bilibili.js"], 10000);
        let videoSource = await tab.run();
        tab.remove();
        if (videoSource === "timeout") {
            Socket.log("超时了");
            throw new Error("timeout");
        } else if (!videoSource) {
            Socket.log("提取出错");
            throw new Error("提取出错");
        }
        Socket.log("获取视频源地址:", videoSource);
        let req = getRequest(videoSource);
        let deadline = (parseInt(req.deadline || req.um_deadline || req.expires) * 1000) || (Date.now() + 1000 * 60 * 30);
        Socket.log("视频过期时间:", new Date(deadline));
        Socket.log("上报视频源地址到目录");
        await Http.call("https://chatbot.api.talkmoment.com/video/link/post", {
            web_url: webUrl,
            video_url: videoSource,
            img_url: "",
            created_at: Date.now(),
            deadline: deadline
        });
        tab.remove();
    };

    const runPearVideoTask = async(task, webUrl) => {
        Socket.log("打开PearVideo网页web_url=", webUrl);
        let tab = new Tab(webUrl, ["./business/script_pearvideo.js"], 10000);
        let videoSource = await tab.run();
        tab.remove();
        if (videoSource === "timeout") {
            Socket.log("超时了");
            throw new Error("timeout");
        } else if (!videoSource) {
            Socket.log("提取出错");
            throw new Error("提取出错");
        }
        Socket.log("获取视频源地址:", videoSource);
        let deadline = Date.now() + 1000 * 60 * 60 * 24 * 30;
        Socket.log("视频过期时间:", new Date(deadline));
        Socket.log("上报视频源地址到目录");
        await Http.call("https://chatbot.api.talkmoment.com/video/link/post", {
            web_url: webUrl,
            video_url: videoSource,
            img_url: "",
            created_at: Date.now(),
            deadline: deadline
        });
    };
    const postDataToMessage = async(data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=suck_url_fail`, data);
    };
    const postDataToMessage2 = async(data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=suck_url_timeout`, data);
    };

    const runDefaultTask = async(task, webUrl) => {
        console.log("!!!!!!!未知的视频来源 打开网页web_url=", webUrl);
        let tab = new Tab(webUrl, ["./business/script_default.js"], 20000);
        let videoSource = await tab.run();
        tab.remove();
        if (videoSource == "timeout") {
            let timeoutData = {
                task: task,
                timeout: "ttTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTtt"
            }
            await postDataToMessage2(timeoutData);
            Socket.log("超时了");
            throw new Error("timeout");
        } else if (!videoSource) {
            await postDataToMessage(task);
            Socket.log("提取出错");
            throw new Error("提取出错");
        }
        Socket.log("获取视频源地址:", videoSource);
        let deadline = Date.now() + 1000 * 60 * 10;
        Socket.log("上报视频源地址到目录");
        await Http.call("https://chatbot.api.talkmoment.com/video/link/post", {
            web_url: webUrl,
            video_url: videoSource,
            img_url: "",
            created_at: Date.now(),
            deadline: deadline
        });
    };

    let runTask = async (task) => {
        let lego = task.lego;
        let {type, source, mobileSource} = extractWebUrl(lego.R);
        if (type === "bilibili" && source && mobileSource) {
            console.log("使用的是 B站 SCRIPT");
            await runBilibiliTask(task, source, mobileSource);
        } else if (type === "pearvideo" && source) {
            console.log("使用的是 梨视频 SCRIPT");
            await runPearVideoTask(task, source);
        } else if (type === "zuiyou" && source) {
            // DO NOTHING
            console.log("使用的是 最右 SCRIPT");
        } else {
            console.log("使用的是 默认的 SCRIPT");
            await runDefaultTask(task, source);
        }
    };

    (async () => {
        Socket.startHeartBeat("bilibili_video_url");
        while (true) {
            console.log("-----------------------------分割线----------------------------");
            let task = null;
            try {
                task = await Http.call(`https://chatbot.api.talkmoment.com/video/task/fetch`);
            } catch (err) {
                Socket.error("获取任务失败, err=", err.stack);
                continue;
            }
            if (task.task_id === 0) {
                Socket.log("暂时没有任务");
                await Async.sleep(1000);
                continue;
            }
            Socket.log(`取得任务,task=`, task);
            try {
                await runTask(task);
                await Http.call(`https://chatbot.api.talkmoment.com/video/task/resolve`, task);
                console.log("resolved");
            } catch (err) {
                Socket.error("任务失败, err=", err.stack);
                if (err.stack && err.stack.indexOf("提取出错") >= 0) {
                    task.failed_count = 1000;
                } else {
                    ++task.failed_count;
                }

                try{
                    await Http.call(`https://chatbot.api.talkmoment.com/video/task/reject`, task);
                    console.log("reject");
                }catch(e){
                    console.log("这我就没招数了");
                    console.log(e);
                }
            }
        }
    })();
});

//微信里面的视频
//https://mp.weixin.qq.com/s?__biz=MzI5NjQzMzQ0MQ%3D%3D&mid=2247484472&idx=2&sn=85c0bdf3e7282a6265a9bef77999640e#wechat_redirect

//易车网
//http://vc.yiche.com/vplay/357099.html

//pptv
//youku
//iqiyi