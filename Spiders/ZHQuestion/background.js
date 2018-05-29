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

    let i = 0;

    let run = async(i) => {
        let data = await Queue.readDateFromMessage("ZHH", i);
        data = data.result[0]
        data = JSON.parse(data);
        data = JSON.parse(data);
        console.log(data);

        let keyword = data.keyword;
        console.log(keyword);
        let url = "https://www.zhihu.com" + data.url;

        let tab = new Tab(url, ["./business/scriptQ.js"]);
        let result = await tab.run();
        console.log(result);

    }

    (async() => {
        await run(i);
    })()

});
