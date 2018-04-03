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
    "../service/saveFile",
    "../api/fileControll",
], (Config, Http, Async, Task, Socket, Tab, SaveFile, FileControll) => {

    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${task.name}`, data);

        let query = {
            name: "wash_bee_data",
            config: JSON.stringify({
                bee_source: "bilibili_video_detail",
                msg_topic: "bilibili_video_detail",
                brick_id: JSON.parse(task.config)["brick_id"]
            })
        }
        await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", query)
    };

    const postDataToDereplicate = async(task) => {
        let query = {
            partition: task.name,
            key: task.value
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);
            let taskConfig = JSON.parse(task.config);

            Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
            let tab = new Tab(task.value, ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);

            if (taskConfig.up_name) {
                data.up_name = taskConfig.up_name;
            } else if (taskConfig.keyword) {
                data.keyword = taskConfig.keyword;
            }
            data.brick_id = taskConfig.brick_id || 0;

            task.data = JSON.stringify(data);
            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

            Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
            await postDataToMessage(task, data);
            Socket.log(`发送爬取结果到消息队列完成`);

            //FileControll.append("bilibiliVideoDetail", JSON.stringify(data) + "\n");

            Socket.log(`添加内容url(${task.value})到去重模块的历史集合`);
            await postDataToDereplicate(task);
            Socket.log(`添加到去重模块成功`);

            Socket.log(`上报爬取任务成功,task=`, task.stack);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);

            Socket.emitEvent({
                event: "detail_item_finish",
                bee_name: task.name,
                task_id: task.id
            });
        } catch(err) {
            Socket.error("爬取失败,err=", err);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async() => {
        const BEE_NAME = "bilibili_video_detail";
        const SLEEP_TIME = 10000;
        Socket.startHeartBeat(BEE_NAME);
        while (true) {
            let task = await Task.fetchTask(BEE_NAME);
            if (task === null) {
                Socket.log("暂时没有任务");
                await Async.sleep(SLEEP_TIME);
                continue;
            }
            await runTask(task);
        }
    })();

});
