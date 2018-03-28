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

    const filterItems = async(task, data) => {
        let query = {
            partition: task.name,
            keys: data.items.map(item => item.url)
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    };

    const postDetailTasks = async(data) => {
        for (let item of data.items) {
            let query = {
                name: "bilibili_video_detail",
                value: item.url,
                config: "{}",
                scheduled_at: Date.now()
            };
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/post`, query);
            Socket.log(`向Scheduler添加task=`, task);
        }
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);

            let baseUrl = "https://search.bilibili.com/all?keyword=" + task.value;

            let tabCount = new Tab(baseUrl, ["./business/script1.js"]);

            let pageCount = await tabCount.run();
            Socket.log("当前关键词共有"+ pageCount + "页");

            let dataArray = [];
            for(let i = 1;i <= pageCount;i++){
                let url = baseUrl + "&page=" + i;
                let tab = new Tab(url, ["./business/script.js"]);
                let data = await tab.run();
                Socket.log(`爬取完成,data=`, data);

                await filterItems(task, data);
                Socket.log(`过滤掉已爬取的链接后,data=`, data);

                for(let da of data){
                    dataArray.push(da);
                }

                Socket.log(`开始添加详情页爬取任务`);
                await postDetailTasks(data);
                Socket.log(`详情页爬取任务添加完成`);
            }

            task.data = JSON.stringify(dataArray);
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
        const BEE_NAME = "bilibili_keyword_list";
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
