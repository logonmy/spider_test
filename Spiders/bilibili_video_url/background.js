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

    let runTask = async() => {
        let href = "https://m.bilibili.com/video/av24588267.html";
        let tab = new Tab(href, ["./business/script.js"]);
        let data = await tab.run();
        tab.remove();
        console.log(data);
    }

    (async () => {
        // Socket.startHeartBeat(DETAIL_BEE_NAME);
        // while (true) {
        //     let task = await Task.fetchTask(DETAIL_BEE_NAME);
        //     if (task === null) {
        //         Socket.log("暂时没有任务");
        //         await Async.sleep(10000);
        //         continue;
        //     }
        //     await runTask(task);
        // }
        await runTask();
    })();

});
