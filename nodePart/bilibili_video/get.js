const Socket = require("../api/socket").Socket;
const Http = require("../api/https").Http;
const exec = require('child_process').exec;
const sleep = (s = 5) => {return new Promise(resolve => setTimeout(resolve, s * 1000))};

let g = {};

process.on("uncaughtError", async () => {
    process.exit(0);
})

process.on("exit", async () => {
    console.log("exit之前执行一下");
    let task = JSON.parse(g.task);
	task.retry = true;
	task = JSON.stringify(task);
	await Http.call(`https://chatbot.api.talkmoment.com/video/task/reject`, task);
	console.log("reject");
})

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

const parse = (data) => {
	if(!data.streams) return;
	data = data.streams;
	if(data.__default__) return data.__default__.src[0];
	for(let key in data){
		if(key.indexOf("720") > -1){
			return data[key].src[0];
		}
	}
	for(let key in data){
		return data[key].src[0];
	}
}

const get = (url) => {
    return new Promise((resolve, reject) => {
        let cmdStr = "you-get --json " + url;
        exec(cmdStr, function (err, stdout, stderr) {
            if (err) {
                reject('you-get 获取失败wrong:' + stderr);
            } else {
                try {
                	let data = JSON.parse(stdout);
                	resolve(parse(data));
                } catch (e) {
                    reject("prase 判断格式失误wrong:" + e);
                }

            }
        });
    })
}

const runTask = async (task) => {
    task = JSON.parse(task);
    let source = JSON.parse(task.result.lego.R).source;
    Socket.log("目前获取的source 为 " + source);
    
    if (source.indexOf("izuiyou") > -1) {
        Socket.log("最右视频 goForever");
        //await Task.goForever(task, source, source);
        throw new Error("zuiyou");
        return;
    }
    
    let videoSource = await get(source);
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

}

(async () => {
    Socket.startHeartBeat("bilibili_video_url_node");
    let run = true;
    while (run) {
    	console.log("---------------------------这是一条又长又显眼的分割线-----------------------------")
        run = true;
        let task = null;
        try {
            task = await Http.call(`https://chatbot.api.talkmoment.com/video/task/fetch`);
            g.task = task;
        } catch (err) {
            Socket.error("获取任务失败, err=", err.stack);
            continue;
        }
        if (task.id === 0) {
            Socket.log("暂时没有任务");
            await sleep(10000);
            continue;
        }
        Socket.log(`取得任务,task=`, task);
        try {
            await runTask(task);
            await Http.call(`https://chatbot.api.talkmoment.com/video/task/resolve`, task);
            console.log("resolve");
        } catch (err) {
            Socket.error("任务失败, err=", err.stack);
            if(err.stack && err.stack.indexOf("zuiyou") > -1){
            	let source = JSON.parse(JSON.parse(task).result.lego.R).source;
            	await Http.call("https://chatbot.api.talkmoment.com/video/link/post", {
			        web_url: source,
			        video_url: source,
			        img_url: "",
			        created_at: Date.now(),
			        deadline: (Date.now() + 1000 * 60 * 60 * 24 * 7 * 4)
			    });
		 		await Http.call(`https://chatbot.api.talkmoment.com/video/task/resolve`, task);
		 		console.log("resolve, forever zuiyou")
            }else{
            	task = JSON.parse(task);
            	task.retry = true;
            	task = JSON.stringify(task);
            	await Http.call(`https://chatbot.api.talkmoment.com/video/task/reject`, task);
            	console.log("reject");
            }
        }
    }
})();