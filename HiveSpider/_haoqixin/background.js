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
], (Config, Http, Async, Task, Socket, Tab) => {

    const LIST_BEE_NAME = "haoqixin_index_update";
    const DETAIL_BEE_NAME = "haoqixin_index_detail";

    const filterItems = async(task, data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: data.items.map(item => item.url)
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    };

    const postDetailTasks = async(listTask, data) => {
        for (let item of data.items) {
            let query = {
                name: DETAIL_BEE_NAME,
                value: item.url,
                config: JSON.stringify({
                    brick_id: JSON.parse(listTask.config).brick_id
                }),
                scheduled_at: Date.now()
            };
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/post`, query);
            Socket.log(`向Scheduler添加task=`, task);
            Socket.emitEvent({
                event: "list_item_added",
                bee_name: LIST_BEE_NAME,
                item: item,
                task: task
            });
        }
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

            let tab = new Tab(task.value, ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);

            Socket.log(`开始过滤`);
            await filterItems(task, data);
            Socket.log(`过滤掉已爬取的链接后,data=`, data);

            Socket.log(`开始添加详情页爬取任务`);
            await postDetailTasks(task, data);
            Socket.log(`详情页爬取任务添加完成`);

            task.data = JSON.stringify(data);
            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

            await repostTask(task);
            Socket.log(`爬取任务完成`);
        } catch(err) {
            Socket.error("爬取失败,err=", err.stack);
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
            await runTask(task)
        }
    })();

});
