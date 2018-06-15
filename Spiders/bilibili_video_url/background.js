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
            for(let i = 0; i < strs.length; i ++) {
                request[strs[i].split("=")[0]]=strs[i].split("=")[1];
            }
        }
        return request;
    };

    const extractSource = (legoR) => {
        let parts = legoR.split("||");
        for (let part of parts) {
            try {
                let model = JSON.parse(part);
                if (model.source.indexOf("www.bilibili.com") >= 0) {
                    let avcode = model.source.substring(model.source.indexOf("www.bilibili.com/video/") + "www.bilibili.com/video/".length);
                    let mobileSource = "https://m.bilibili.com/video/" + avcode.substring(0, avcode.length - 1) + ".html";
                    return [model.source, mobileSource];
                }
            } catch(err) { }
        }
        return [null, null];
    };

    let runTask = async(task) => {
        let lego = task.lego;
        let [source, mobileSource] = extractSource(lego.R);
        if (source && mobileSource) { } else return;
        Socket.log("打开网页href=", mobileSource);
        let tab = new Tab(mobileSource, ["./business/script.js"]);
        let data = await tab.run();
        tab.remove();
        let videoSource = "https:" + data;
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
            try {
                let task = await Http.call(`https://chatbot.api.talkmoment.com/video/task/fetch`);
                if (task.id === 0) {
                    Socket.log("暂时没有任务");
                    await Async.sleep(10000);
                    continue;
                }
                Socket.log(`取得任务,task=`, task);
                await runTask(task);
                await Http.call(`https://chatbot.api.talkmoment.com/video/task/resolve`, task);
            } catch(err) {
                Socket.error("任务失败, err=", err.stack);
            }
        }
    })();

});
