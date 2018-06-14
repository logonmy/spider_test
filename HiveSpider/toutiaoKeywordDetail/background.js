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

    const DETAIL_BEE_NAME = "toutiao_keyword_detail";

    const filterItem = async(task) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: [task.value]
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        return res.filter_result[0];
    };

    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    const postWashTask = async(detailTask, data) => {
        let washTask = {
            name: "wash_corpus",
            value: "",
            config: JSON.stringify({
                bee_source: DETAIL_BEE_NAME,
                brick_id: JSON.parse(detailTask.config).brick_id,
                publish: JSON.parse(detailTask.config).publish
            }),
            data: JSON.stringify(data),
            scheduled_at: Date.now()
        };
        let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask)
        return d.id;
    };

    const postDataToDereplicate = async(task) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            key: task.value
        };
        console.log(query, "去重讯息");
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let filter = await filterItem(task);
            if (!filter) {
                Socket.log(`网页(url=${task.value})已经爬取过, 跳过`);
            } else {
                let config = JSON.parse(task.config);

                Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
                let tab = new Tab(task.value, ["./business/script.js"]);

                Socket.log(`开始爬取`);
                let data = await tab.run();
                Socket.log(`爬取完成,data=`, data);

                if(data && data.comments && data.comments.length < 3){
                    await Task.rejectTask(task, "评论数小于3条 reject掉了");
                }

                if (config.up_name) {
                    data.up_name = config.up_name;
                } else if (config.keyword) {
                    data.keyword = config.keyword;
                }
                data.brick_id = config.brick_id;

                Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
                await postDataToMessage(task, data);
                Socket.log(`发送爬取结果到消息队列完成`);

                Socket.log(`发起清洗任务`);
                let task_id = await postWashTask(task, data);

                Socket.log('发送到记数的地方');
                await Task.countTask(task_id, DETAIL_BEE_NAME);

                Socket.log(`添加内容url(${task.value})到去重模块的历史集合`);
                await postDataToDereplicate(task, data);
                Socket.log(`添加到去重模块成功`);

                task.data = JSON.stringify(data);
                Socket.log(`提交爬取任务结果数据`);
                await Task.putTaskData(task);
                Socket.log(`提交爬取任务结果数据完成`);
            }
            if(task.scheduled_at == 9999999999999){
                Socket.emitEvent({
                    event: "detail_item_finish",
                    bee_name: task.name,
                    task_id: task.id
                });
            }

            Socket.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);
        } catch(err) {
            Socket.error("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async() => {
        Socket.startHeartBeat(DETAIL_BEE_NAME);
        while (true) {
            let task = await Task.fetchTask(DETAIL_BEE_NAME);
            if (task === null) {
                Socket.log("暂时没有任务");
                await Async.sleep(10000);
                continue;
            }
            await runTask(task);
        }
    })();


});
