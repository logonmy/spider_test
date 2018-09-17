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

    const QUEUE_NAME = "yigemingzieryi";
    const QUEUE_NAME2 = "yigemingzieryibalenidongbu";
    const sleep = async (time) => {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve()
            }, time * 1000)
        })
    }

    const postDataToMessage = async (data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${QUEUE_NAME2}`, data);
    };

    const getDataFromMessage = async () => {
        let re = await Http.call(`http://bee.api.talkmoment.com/message/subscribe/try?topic=${QUEUE_NAME}`);
        return re;
    };

    const runTask = async (url) => {
        try {
            let tab = new Tab(url, ["./business/script.js"], 10000);
            let data = await tab.run();
            console.log(data);
            await postDataToMessage({
                url: url,
                brief: data
            })
        } catch (err) {

        }
    };

    (async () => {
        while (true) {
            console.log("###########################")

            let url = await getDataFromMessage();
            eval("var a = " + url);
            console.log(a)
            if(a.substr(0, 2) == "//"){
                a = a.substr(2);
            }
            await runTask(a);
            await sleep(2290202);
        }
    })();

});
