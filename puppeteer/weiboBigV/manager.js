const child_process = require("child_process");
const redisAction = require("./dataBase/redisAction").redisAction;
const dataBaseConfig = require("./dataBase/redisAction").dataBaseConfig;
const init = require("./init/addToDatabase").init;
const cpus = require("os").cpus();
const weiboclean = require("./clean/weiboclean").weiboclean;

//todo 添加worker长时间没有返回成功数据就重新发送任务的机制

let getUser = (() => {
    let users = [{
        username: "15351702865",
        password: "cqcp815"
    }, {
        username: "yuchenguangfd@gmail.com",
        password: "Washu1234"
    }, {
        username: "guyiyang@gmail.com",
        password: "Washu1234"
    }, {
        username: "15850766679",
        password: "xrz19940822"
    }];
    return () => {
        let result = users.shift();
        users.push(result);
        return result;
    }
})();

let workers = {};
let childCount = 4;

let createWorker = (urlCache) => {
    let worker = child_process.fork(__dirname + "/worker.js");
    worker.on('message', async function (m) {

        console.log("收到" + worker.pid + "号娃的请求");

        let sendUrl = async () => {
            if (urlCache.length === 0) {
                redisAction.start();
                let singleUrl = await redisAction.lpop(dataBaseConfig.toCrawlName);
                redisAction.quit();
                if (singleUrl) {
                    worker.send({
                        type: "task",
                        url: singleUrl
                    })
                } else {
                    redisAction.start();
                    let count = 0;
                    while (await redisAction.lpop(dataBaseConfig.urlSuccessName) != null) {
                        count++;
                    }
                    console.log("清空已经成功的完成，共计删除条数", count);
                    redisAction.quit();
                    console.log("今天总算是跑完啦 👿👿");
                    await weiboclean();
                }
            } else {
                let singlelUrl = urlCache.shift();
                console.log("从cache给的任务singleUrl为",singleUrl)
                worker.send({
                    type: "task",
                    url: sinlgelUrl
                })
            }
        }
        switch (m.type) {
            case "launched": {
                worker.send({
                    type: "user",
                    user: getUser()
                })
                break;
            }
            case "login": {
                await sendUrl();
                break;
            }
            case "success": {
                redisAction.start();
                redisAction.rpush(dataBaseConfig.urlSuccessName, m.url);
                redisAction.quit();
                await sendUrl();
                break;
            }
            case "error": {
                urlCache.push(m.url);
                sendUrl();
                break;
            }
        }
    })

    worker.on("exit", () => {
        console.log(worker.pid + "号娃退出");
        delete workers[worker.pid];
        createWorker();
    })
    workers[worker.pid] = worker;
    console.log("创建" + worker.pid + "号娃");
}

let run = async () => {
    console.log("今天也是元气满满的一天 😄😄");
    await init();

    let getUrlCache = async () => {
        let urlCache = [];
        redisAction.start();
        let run = async () => {
            let url = await redisAction.lpop(dataBaseConfig.urlCacheName);
            if (url) {
                urlCache.push(url);
                await run();
            }
        }
        await run();
        redisAction.quit();
        console.log("cacheUrl中内容", urlCache);
        return urlCache;
    };

    let urlCache = await getUrlCache();

    process.on("beforeExit", async () => {
        console.log("beforeExit")
        while (urlCache.length != 0) {
            redisAction.start();
            await redisAction.rpush(dataBaseConfig.urlCacheName, urlCache.shift());
            redisAction.quit();
        }
    })

    process.on("exit", async () => {
        console.log("exiting");
        for (var pid in workers) {
            workers[pid].kill();
        }
    })

    // for (let i = 0; i < cpus.length; i++) {
    //     createWorker(urlCache);
    // }
    for (let i = 0; i < 4; i++) {
        createWorker(urlCache);
    }
}
run();