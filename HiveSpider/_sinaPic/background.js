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
], (Config, Http, Async, Task, Socket, Tab, FileControll) => {

    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${task.name}`, data);
    };

    const postDataToDereplicate = async(task, data) => {
        let query = {
            partition: task.name,
            key: data.url
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const filterItems = async(task, data) => {
        let query = {
            partition: task.name,
            keys: data.items.map(item => item.url)
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let sinaUrl = "http://gif.sina.com.cn/";
            Socket.log(`打开网页Tab(url=${sinaUrl}), 注入爬取逻辑`);

            let tab = new Tab(sinaUrl, ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);
            task.data = JSON.stringify(data.items);

            await filterItems(task, data);

            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

            Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
            await postDataToMessage(task, data);

            //FileControll.append("bilibiliVideoDetail", JSON.stringify(data) + "\n");

            Socket.log(`发送爬取结果到消息队列完成`);

            Socket.log(`添加内容url(${data.url})到去重模块的历史集合`);
            for(let da of data.items){
                console.log(da.url);
                await postDataToDereplicate(task, da.url)
            }
            Socket.log(`添加到去重模块成功`);

            Socket.log(`上报爬取任务成功,task=`, task.stack);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);
        } catch(err) {
            Socket.log("爬取失败,err=", err);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async() => {
        const BEE_NAME = "sina_index_update";
        const SLEEP_TIME = 10000;
        Socket.startHeartBeat(BEE_NAME);
        while (true) {
            let task = await Task.fetchTask(BEE_NAME);
            if (task === null) {
                console.log("暂时没有任务");
                await Async.sleep(SLEEP_TIME);
                continue;
            }
            await runTask(task);
        }
    })();

});
