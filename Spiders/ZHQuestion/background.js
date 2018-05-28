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



    let run = async() => {
        console.log("running");
        let data = await Queue.readDateFromMessage("ZHDTopicQuestion", 0);
        data = data.result[0]
        data = JSON.parse(data);
        let keyword = (data.keyword);
        let url = data.url;

        let tab = new Tab(url, ["./business/script.js"]);
        let data = await tab.run();

    }


    run();

});
