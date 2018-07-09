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
    const DETAIL_BEE_NAME = "weiboFollowBoy";
    const postDataToMessage = async (data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    let keyword = [0];

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };


    const runTask = async (k) => {

        for (let p = 1; p < 50; p++) {

            try {
                let a = "http://s.weibo.com/user/" + k + "&auth=ord&gender=women&age=22y&page=" + p;
                console.log(a);
                let tab = new Tab(a, ["./business/script.js"]);
                setTimeout(() => {
                    throw new Error("efwr");
                }, 10000);
                let data = await tab.run();
                for(let d of data){
                    await postDataToMessage(d);
                }
                console.log(data);
                await sleep(Math.random()* 5000 + 5000);
            } catch (err) {
                console.log("什么玩意");
            }
        }

    };

    (async () => {
        for (let k of keyword) {
            await runTask(k);
        }
    })();

});
