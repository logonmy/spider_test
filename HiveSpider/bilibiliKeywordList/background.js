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

    const LIST_BEE_NAME = "bilibili_keyword_list";
    const DETAIL_BEE_NAME = "bilibili_video_detail";

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
                    brick_id: listTask.config.brick_id,
                    keyword: listTask.value
                }),
                scheduled_at: 9999999999999
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

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let config = JSON.parse(task.config);
            let numItemLimit = config.num_item_limit || 10;

            Socket.log(`打开网页Tab(keyword=${task.value}), 注入爬取逻辑`);
            let baseUrl = "https://search.bilibili.com/all?keyword=" + task.value;
            let tabCount = new Tab(baseUrl, ["./business/script1.js"]);
            let pageCount = await tabCount.run();
            Socket.log("当前关键词共有"+ pageCount + "页");

            let taskData = [];
            for (let i = 1; i <= pageCount; i++) {
                Socket.log(`正在爬取第${i}/${pageCount}页`);
                let url = baseUrl + "&page=" + i;
                let tab = new Tab(url, ["./business/script.js"]);
                let data = await tab.run();
                Socket.log(`爬取完成,data=`, data);

                await filterItems(task, data);
                Socket.log(`过滤掉已爬取的链接后,共有${data.items.length}条,data=`, data);

                let needCount = numItemLimit - taskData.length;

                if (0 < needCount && needCount <= data.items.length) {
                    data.items = data.items.slice(0, needCount);

                    for (let da of data.items) {
                        taskData.push(da);
                    }

                    Socket.log(`开始添加详情页爬取任务`);
                    await postDetailTasks(task, data);
                    Socket.log(`详情页爬取任务添加完成`);
                    break;
                } else if (needCount > data.items.length) {
                    for (let da of data.items) {
                        taskData.push(da);
                    }
                    Socket.log(`开始添加详情页爬取任务`);
                    await postDetailTasks(task, data);
                    Socket.log(`详情页爬取任务添加完成`);
                } else if (0 >= needCount) {
                    break;
                }
            }

            Socket.emitEvent({
                event: "list_item_finish",
                bee_name: task.name
            });

            task.data = JSON.stringify(taskData);
            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

            Socket.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);

        } catch(err) {
            Socket.log("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
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
