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

    const LIST_BEE_NAME = "sina_index_update";
    const DETAIL_BEE_NAME = "sina_index_detail";

    const filterItems = async(task, data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: data.items.map(item => item.url)
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    };

    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    const postWashTask = async(detailTask, data) => {
        let washTask = {
            name: "wash_corpus",
            value: "",
            config: JSON.stringify({
                bee_source: LIST_BEE_NAME,
                brick_id: JSON.parse(detailTask.config).brick_id,
                publish: true
            }),
            data: JSON.stringify(data),
            scheduled_at: Date.now()
        };
        await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask)
    };

    const postDataToDereplicate = async(task, data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            key: data.url
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const repostTask = async(listTask) => {
        let timegap = JSON.parse(listTask.config).timegap;
        let nextScheduledAt = Date.now() + timegap;
        let query = {
            task_id: listTask.id,
            scheduled_at: nextScheduledAt
        };
        Socket.log(`发布下一次定时爬取任务`);
        let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/repost`, query);
        Socket.log(`下一次定时爬取任务发布成功,task=`, task);
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
            let sinaUrl = task.value;
            let tab = new Tab(sinaUrl, ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);

            Socket.log(`开始过滤`);
            await filterItems(task, data);
            Socket.log(`过滤掉已爬取的链接后,data=`, data);

            Socket.log(`开始保存详情数据`);
            for(let da of data.items){
                Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
                await postDataToMessage(task, da);
                Socket.log(`发送爬取结果到消息队列完成`);
                Socket.log(`发起清洗任务`);
                await postWashTask(task, da);
                Socket.log(`添加内容url(${data.url})到去重模块的历史集合`);
                await postDataToDereplicate(task, da);
                Socket.log(`添加到去重模块成功`);
            }

            task.data = JSON.stringify(data);
            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

            await repostTask(task);
            Socket.log(`爬取任务完成`);
        } catch(err) {
            Socket.log("爬取失败,err=", err);
            Socket.log(`上报爬取任务失败,task=`, task);
            await repostTask(task);
        }
    };

    (async() => {
        Socket.startHeartBeat(LIST_BEE_NAME);
        while (true) {
            let task = await Task.fetchTask(LIST_BEE_NAME);
            if (task === null) {
                Socket.log("暂时没有任务");
                await Async.sleep(10000);
                continue;
            }
            await runTask(task);
        }
    })();

});
