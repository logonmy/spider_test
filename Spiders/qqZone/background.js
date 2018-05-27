require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {

    const lh = "https://i.qq.com/";


    (async () => {
        let lt = new Tab(lh, ["./business/script.js"]);
        let result = await lt.run();
        console.log(result);
    })()

});
