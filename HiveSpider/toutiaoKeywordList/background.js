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
    let brick_id = 16661;
    let publish = false;
    let scheduled_at = 9999999999999;

    const LIST_BEE_NAME = "toutiao_keyword_list";
    const DETAIL_BEE_NAME = "toutiao_keyword_detail";

    const filterItems = async (task, data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: data.items.map(item => item.url)
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    };

    const postDetailTasks = async (listTask, data) => {
        for (let item of data.items) {
            let query = {
                name: DETAIL_BEE_NAME,
                value: item.url,
                config: JSON.stringify({
                    brick_id: brick_id,
                    keyword: listTask.value,
                    publish: publish
                }),
                scheduled_at: scheduled_at
            };
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/post`, query);
            Socket.log(`向Scheduler添加task=`, task);
            if(scheduled_at == 9999999999999){
                Socket.emitEvent({
                    event: "list_item_added",
                    bee_name: LIST_BEE_NAME,
                    item: item,
                    task: task
                });
            }
        }
    };

    const getBrickId = async () => {
        let getTrueName = () => {
            var date = new Date();
            var yyyy = date.getFullYear();
            var mm = date.getMonth() + 1;
            if (mm < 10) {
                mm = "0" + mm.toString();
            }
            var dd = date.getDate();
            if (dd < 10) {
                dd = "0" + dd.toString();
            }
            var name = yyyy + mm + dd + "更新";
            return name;
        }

        let trueName = getTrueName();

        let data = await Http.request("http://chatbot.api.talkmoment.com/lego/library/brick/list?limit=20&version=002");
        data = JSON.parse(data);
        data = data.result;
        for (let da of data) {
            if (da.name == trueName) {
                return da.id;
            }
        }
        return false;
    }

    const initTask = async (task) => {
        let config = JSON.parse(task.config);
        if(config.brick_id){
            brick_id = config.brick_id;
        }else{
            brick_id = await getBrickId();
        }
        if(config.publish){
            publish = true;
        }
        if(config.scheduled_at){
            scheduled_at = Date.now();
        }
    };

    const runTask = async (task) => {
        await initTask(task);
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let config = JSON.parse(task.config);
            let numItemLimit = config.num_item_limit || 10;

            Socket.log(`打开网页Tab(keyword=${task.value}), 注入爬取逻辑`);
            let keyUrl = "https://www.toutiao.com/search/?keyword=" + task.value;
            //todo tab 添加植入变量函数

            let tab = new Tab(keyUrl, ["window.numItemLimit=" + numItemLimit, "./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);

            Socket.log(`开始过滤`);
            await filterItems(task, data);
            Socket.log(`过滤掉已爬取的链接后,data=`, data);

            if (data.items.length >= numItemLimit) {
                data.items = data.items.slice(0, numItemLimit);
            }


            Socket.log(`开始添加详情页爬取任务`);
            await postDetailTasks(task, data);
            Socket.log(`详情页爬取任务添加完成`);

            if(scheduled_at == 9999999999999){
                Socket.emitEvent({
                    event: "list_item_finish",
                    bee_name: task.name
                });
            }

            task.data = JSON.stringify(data);
            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

            Socket.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);
        } catch (err) {
            Socket.error("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async () => {
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
