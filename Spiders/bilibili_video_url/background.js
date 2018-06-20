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
                    let mobileSource = "https://m.bilibili.com/video/" + avcode.substring(0, avcode.length - 1) + ".html";
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
                } else {
                    return {
                        type: null,
                        source: null,
                        mobileSource: null
                    }
                }
            } catch (err) {
            }
        }
        return {
            type: null,
            source: null,
            mobileSource: null
        };
    };

    let runTask = async (task) => {
        let lego = task.lego;
        let {type, source, mobileSource} = extractWebUrl(lego.R);
        let tab = null;
        if (type === "bilibili" && source && mobileSource) {
            Socket.log("打开网页href=", mobileSource);
            tab = new Tab(mobileSource, ["./business/script_bilibili.js"], 2000);
        } else {
            console.log("!!!!!!!不支持的视频来源", lego.R);
            return;
        }
        let videoSource;
        videoSource = await tab.run();
        tab.remove();
        if (videoSource) {
        } else if(videoSource == "timeout"){
            Socket.log("超时了");
            throw new Error("timeout");
            return;
        }else {
            Socket.log("提取出错");
            throw new Error("提取出错");
            return;
        }
        Socket.log("获取视频源地址:", videoSource);
        let req = getRequest(videoSource);
        let deadline = (parseInt(req.deadline || req.um_deadline || req.expires) * 1000) || (Date.now() + 1000 * 60 * 30);
        Socket.log("上报视频源地址到目录");
        await Http.call("https://chatbot.api.talkmoment.com/video/link/post", {
            web_url: source,
            video_url: videoSource,
            img_url: "",
            created_at: Date.now(),
            deadline: deadline
        });
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
            if (task.id === 0) {
                Socket.log("暂时没有任务");
                await Async.sleep(10000);
                continue;
            }
            Socket.log(`取得任务,task=`, task);
            try {
                await runTask(task);
                await Http.call(`https://chatbot.api.talkmoment.com/video/task/resolve`, task);
                console.log("resolved");
            } catch (err) {
                Socket.error("任务失败, err=", err.stack);
                if(err.stack && err.stack.indexOf("提取出错") > -1){
                    task.retry = false;
                }else{
                    task.retry = true;
                }
                await Http.call(`https://chatbot.api.talkmoment.com/video/task/reject`, task);
                console.log("reject");
            }
        }
    })();

});
