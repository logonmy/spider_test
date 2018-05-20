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

    let brick_id = 16661;

    const filterItems = async(data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: data.items.map(item => item.url)
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    };

    const postDetailTasks = async(data) => {
        for (let item of data.items) {
            let query = {
                name: DETAIL_BEE_NAME,
                value: item.url,
                config: JSON.stringify({
                    brick_id: brick_id,
                    from_index: true
                }),
                scheduled_at: Date.now()
            };
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/post`, query);
            Socket.log(`向Scheduler添加task=`, task);
        }
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`,);

            Socket.log(`打开网页Tab(url=http://www.qdaily.com/), 注入爬取逻辑`);

            let tab = new Tab("http://www.qdaily.com/", ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);

            Socket.log(`开始过滤`);
            await filterItems(data);
            Socket.log(`过滤掉已爬取的链接后,data=`, data);

            Socket.log(`开始添加详情页爬取任务`);
            await postDetailTasks(data);
            Socket.log(`爬取任务完成`);
        } catch(err) {
            Socket.error("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`);
        }
    };

    (async() => {
        Socket.startHeartBeat(LIST_BEE_NAME);
        while (true) {
            await runTask()
            await Async.sleep(10 * 60 * 1000);
        }
    })();

});
