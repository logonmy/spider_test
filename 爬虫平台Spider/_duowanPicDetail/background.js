require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});

require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../service/tab",
], (Config, Http, Async, Task, Tab) => {

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
            console.log(`开始处理爬取任务,task=`, task);

            console.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);

            let tab0 = new Tab(task.value, ["./business/script1.js"]);
            let pageCount = tab0.run();

            let dataArray = []
            for(let i=1;i <= pageCount;i++){
                let tab = new Tab(task.value, ["./business/script.js"]);

                console.log(`开始爬取`);
                let data = await tab.run();
                console.log(`爬取完成,data=`, data);


            }

            //todo 类似的还有 只是现在反应过来
            //task提交爬去任务结果数据 本来task.data应该是一个json 现在 是一个数组了 多个json了
            //是接受类似数据格式 还是一个task可以多次提交？？？？？
            //类似的好像在b站那里
            //
            //q文件被我删了 tab类里面要用 看看那new Promise能不能顶一下 不行就加回来


            task.data = JSON.stringify(data);
            console.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            console.log(`提交爬取任务结果数据完成`);

            console.log(`发送爬取结果到消息队列topic=${task.name}`);
            await postDataToMessage(task, data);
            console.log(`发送爬取结果到消息队列完成`);

            console.log(`添加内容url(${data.url})到去重模块的历史集合`);
            await postDataToDereplicate(task, data);
            console.log(`添加到去重模块成功`);

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
        const BEE_NAME = "duowanPic_index_detail";
        const SLEEP_TIME = 10000;
        while (true) {
            let task = await Task.fetchTask(BEE_NAME);
            if (task === null) {
                await Async.sleep(SLEEP_TIME);
                continue;
            }
            await runTask(task);
        }
    })();

});
