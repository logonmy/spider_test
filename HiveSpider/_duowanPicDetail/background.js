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

    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${task.name}`, data);
    };

    const postDataToDereplicate = async(task, data) => {
        let query = {
            partition: task.name,
            key: data.url
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);

            let tab0 = new Tab(task.value, ["./business/script1.js"]);
            let pageCount = await tab0.run();
            Socket.log("当前图库有"+ pageCount + "张图片");

            let dataArray = []
            for(let i=1;i <= pageCount;i++){
                let tab = new Tab(task.value, ["./business/script.js"]);

                Socket.log(`开始爬取`);
                let data = await tab.run();
                Socket.log(`爬取完成,data=`, data);
                dataArray.push(data);

                Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
                await postDataToMessage(task, data);
                Socket.log(`发送爬取结果到消息队列完成`);

                Socket.log(`添加内容url(${data.url})到去重模块的历史集合`);
                await postDataToDereplicate(task, data);
                Socket.log(`添加到去重模块成功`);

            }
            //todo 类似的还有 只是现在反应过来

            task.data = JSON.stringify(dataArray);
            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

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
        const BEE_NAME = "duowanPic_index_detail";
        const SLEEP_TIME = 10000;
        Socket.startHeartBeat(BEE_NAME);
        while (true) {
            let task = await Task.fetchTask(BEE_NAME);
            if (task === null) {
                console.log("暂时没有任务");
                await Async.sleep(SLEEP_TIME);
                continue;
            }
            await runTask(task);
        }
    })();

});
