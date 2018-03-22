require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});

require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../service/tab"
], (Config, Http, Async, Task, Tab) => {

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
                name: "wx_public_detail",
                value: item.url,
                config: "{}",
                scheduled_at: Date.now()
            };
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/post`, query);
            console.log(`向Scheduler添加task=`, task);
        }
    };

    const runTask = async(task) => {
        try {
            console.log(`开始处理爬取任务,task=`, task);

            console.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);

            let tab0Href = "https://www.newrank.cn/public/info/search.html?value=" + encodeURIComponent(task.value);
            let tab0 = new Tab(tab0Href, ["./business/script1.js"]);
            let wxhaoma = await tab0.run();

            let tabHref = "https://www.newrank.cn/public/info/detail.html?account=" + wxhaoma;
            let tab = new Tab(tabHref, ["./business/script.js"]);

            console.log(`开始爬取`);
            let data = await tab.run();
            console.log(`爬取完成,data=`, data);

            console.log(`开始过滤`);
            await filterItems(task, data);
            console.log(`过滤掉已爬取的链接后,data=`, data);

            console.log(`开始添加详情页爬取任务`);
            await postDetailTasks(data);
            console.log(`详情页爬取任务添加完成`);

            task.data = JSON.stringify(data);
            console.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            console.log(`提交爬取任务结果数据完成`);

            console.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            console.log(`爬取任务完成`);
        } catch(err) {
            console.error("爬取失败,err=", err);
            console.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async() => {
        const BEE_NAME = "wx_xingbang_list";
        const SLEEP_TIME = 10000;
        while (true) {
            let task = await Task.fetchTask(BEE_NAME);
            if (task === null) {
                await Async.sleep(SLEEP_TIME);
                continue;
            }
            await runTask(task)
        }
    })();

});
