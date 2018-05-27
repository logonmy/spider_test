require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {

    const sleep = (s = 5) => {return new Promise(resolve => setTimeout(resolve, s * 1000))};

    (async()=> {
        let keyword = "电竞";
        let souUrl = "https://sou.qq.com/kd.html?keyword=" + keyword;
        let tab = new Tab(souUrl, ["./business/getUin.js"]);
        let uin = await tab.run();

        console.log(uin)

        // let indexUrl = "http://kandian.qq.com";
        // let tab = new Tab(indexUrl, ["./business/script.js"]);
        // let data = await tab.run();
        // await sleep(10)
    })()

});
