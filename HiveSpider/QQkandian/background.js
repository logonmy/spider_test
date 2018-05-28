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

        let keyword = (await Queue.getDataFromMessage("qqKandian")).result;
        keyword = JSON.parse(keyword);
        console.log("keyword", keyword);

        let souUrl = "https://sou.qq.com/kd.html?keyword=" + keyword;
        let tab = new Tab(souUrl, ["./business/getUin.js"]);
        let uin = await tab.run();

        console.log(uin);
        console.log("#######");

        await Queue.postDataToMessage("qqKandian2", JSON.stringify({
            name: keyword,
            uin: uin
        }));

        await sleep(10)
    })()

});
