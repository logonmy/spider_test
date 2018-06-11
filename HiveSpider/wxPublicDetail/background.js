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

    const DETAIL_BEE_NAME = "wx_public_detail";

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
        let publish = true;

        if(JSON.parse(detailTask.config).fromList) publish = false;

        let washTask = {
            name: "wash_corpus",
            value: "",
            config: JSON.stringify({
                bee_source: DETAIL_BEE_NAME,
                brick_id: JSON.parse(detailTask.config).brick_id,
                publish: publish
            }),
            data: JSON.stringify(data),
            scheduled_at: Date.now()
        };
        console.log(detailTask, typeof(detailTask));
        console.log(detailTask.config, typeof(detailTask.config));
        console.log(JSON.parse(detailTask.config), typeof(JSON.parse(detailTask.config)));
        console.log(JSON.parse(detailTask.config).brick_id);
        let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
        return d.id;
    };

    const postDataToDereplicate = async(task, data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            key: task.value
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let filter = await filterItem(task);
            if(!filter){
                Socket.log(`网页(url=${task.value})已经爬取过, 跳过`);
            }else{
                Socket.log(`开始处理爬取任务,task=`, task);

                let taskConfig = JSON.parse(task.config);


                console.log(taskConfig, "@@@@@@@");
                console.log(task, "@@@@@@@");

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
                data.brick_id = taskConfig.brick_id;

                Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
                await postDataToMessage(task, data);
                Socket.log(`发送爬取结果到消息队列完成`);

                console.log(task, "@@@@@@@");
                Socket.log(`发起清洗任务`);
                console.log(data, "############################", task);

                Socket.log(`发起清洗任务`);
                let task_id = await postWashTask(task, data);

                Socket.log('发送到记数的地方')
                await Task.countTask(task_id, DETAIL_BEE_NAME);

                Socket.log(`添加内容url(${task.value})到去重模块的历史集合`);
                await postDataToDereplicate(task);
                Socket.log(`添加到去重模块成功`);

                task.data = JSON.stringify(data);
                Socket.log(`提交爬取任务结果数据`);
                await Task.putTaskData(task);
                Socket.log(`提交爬取任务结果数据完成`);
            }

            Socket.emitEvent({
                event: "detail_item_finish",
                bee_name: task.name,
                task_id: task.id
            });

            Socket.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);

        } catch(err) {
            Socket.error("爬取失败,err=", err.error);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async() => {
        const BEE_NAME = "wx_public_detail";
        const SLEEP_TIME = 10000;
        Socket.startHeartBeat(BEE_NAME);
        while (true) {
            Socket.log("暂时没有任务");
            let task = await Task.fetchTask(BEE_NAME);
            if (task === null) {
                await Async.sleep(SLEEP_TIME);
                continue;
            }
            await runTask(task);
        }
    })();

});
