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

    const DETAIL_BEE_NAME = "bilibili_video_detail";

    const filterItem = async (task) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: [task.value]
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        return res.filter_result[0];
    };

    const postDataToMessage = async (task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    const postWashTask = async (detailTask, data) => {
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
        let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
        return d.id;
    };

    const postDataToDereplicate = async (task) => {
        try{
            console.log("开始去重");
            console.log("丢过去的值为", task.value);
            let query = {
                partition: DETAIL_BEE_NAME,
                key: task.value
            };
            await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
        }catch(e){
            console.log(e)
        }
    };
    const localPass =  (data) => {
        console.log(data.created_at);
        let sixMonthPass = new Date().getTime() - (1000* 6 * 30*24*60*60)
        if(data.created_at < sixMonthPass){
            return false;
        }
        return true;
    }
    const runTask = async (task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let filter = await filterItem(task);
            console.log(task.value, "结束filter", filter);

            if (!filter) {
                Socket.log(`网页(url=${task.value})已经爬取过, 跳过`);
            } else {
                let config = JSON.parse(task.config);

                if (!(task.value.indexOf("/video/") > -1)) {
                    return;
                }
                if (task.value.indexOf("http") > -1) {

                } else {
                    task.value = "https://" + task.value
                }
                Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
                let tab = new Tab(task.value, ["./business/script.js"]);

                Socket.log(`开始爬取`);
                let data = await tab.run();
                Socket.log(`爬取完成,data=`, data);

                if (config.up_name) {
                    data.up_name = config.up_name;
                } else if (config.keyword) {
                    data.keyword = config.keyword;
                }
                data.brick_id = config.brick_id;

                Socket.log(`发送爬取结果到消息队列topic=${task.name}`);

                if (data && data.comments && data.comments.length < 3) {
                    await Task.rejectTask(task, "评论数小于3条 reject掉了");
                    return;
                }

                if(!localPass(data)){
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log(data);
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                    console.log("FFFFFFFFFFFFFFOCUS")
                }else{
                    await postDataToMessage(task, data);
                    Socket.log(`发送爬取结果到消息队列完成`);

                    Socket.log(`发起清洗任务`);
                    console.log("发起清洗任务")
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
                
            }
            if (task.scheduled_at == 9999999999999) {
                Socket.emitEvent({
                    event: "detail_item_finish",
                    bee_name: task.name,
                    task_id: task.id
                });
            }

            console.log("爬取成功");
            Socket.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);
        } catch (err) {
            console.log("爬取失败");
            console.log(err);
            Socket.error("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async () => {
        Socket.startHeartBeat(DETAIL_BEE_NAME);
        while (true) {
            console.log("###########################")
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
