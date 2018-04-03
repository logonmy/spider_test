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
    "../api/fileControll",
    "../service/tab",
], (Config, Http, Async, Task, Socket, FileControll,Tab) => {

    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${task.name}`, data);

        let query = {
            name: "wash_bee_data",
            config: JSON.stringify({
                bee_source: "duowanPic_index_detail",
                msg_topic: "duowanPic_index_detail",
                brick_id: JSON.parse(task.config)["brick_id"]
            })
        }
        await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", query)
    };

    const postDataToDereplicate = async(task, data) => {
        let query = {
            partition: task.name,
            key: data.url
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const runTask = async(task) => {

        let arrayDulicate = (arr) => {
            let checkIn = (str, arr) => {
                for(let a of arr){
                    if(str === a){
                        return true;
                    }
                }
                return false;
            }
            let result = [];

            for(let a of arr){
                if(!checkIn(a,result)){
                    result.push(a);
                }
            }
            return result;
        }

        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
            let baseUrl = task.value;

            let tab0 = new Tab(task.value, ["./business/script1.js"]);
            let pageCount = await tab0.run();
            Socket.log("当前图库有"+ pageCount + "张图片");

            let dataArray = []
            for(let i=1;i <= pageCount;i++){
                let pageUrl = task.value;
                pageUrl = pageUrl + "#p" + i;
                let tab = new Tab(pageUrl, ["./business/script.js"]);

                Socket.log(`开始爬取`);
                let data = await tab.run();
                Socket.log(`爬取完成,data=`, data);
                data.comments = arrayDulicate(data.comments);
                dataArray.push(data);

                task.data = JSON.stringify(data);
                Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
                await postDataToMessage(task, data);
                //FileControll.append("_duowanPicDetail", JSON.stringify(data) + "\n");
                Socket.log(`发送爬取结果到消息队列完成`);
            }

            await postDataToDereplicate(task, {url: baseUrl});
            Socket.log(`添加到去重模块成功`);

            task.data = JSON.stringify(dataArray);
            Socket.log(`提交爬取任务结果数据`);
            await Task.putTaskData(task);
            Socket.log(`提交爬取任务结果数据完成`);

            Socket.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);

            Socket.emitEvent({
                event: "detail_item_finish",
                bee_name: task.name,
                bee_id: task.id
            });
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
