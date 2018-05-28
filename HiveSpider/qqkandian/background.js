require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll",
    "../api/queue"
], (Config, Http, Async, Task, Socket, Tab, File, Queue) => {

    const sleep = (s = 5) => {return new Promise(resolve => setTimeout(resolve, s * 1000))};

    (async()=> {

        await Queue.postDataToMessage("qqKandian", "带你看世界");
        let keyword = (await Queue.getDataFromMessage("qqKandian")).result;

        let souUrl = "https://sou.qq.com/kd.html?keyword=" + keyword;
        let tab = new Tab(souUrl, ["./business/getUin.js"]);
        let uin = await tab.run();

        console.log(uin)
        console.log("#######")
        await sleep(10)
    })()

});
