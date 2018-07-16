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

    const DETAIL_BEE_NAME = "duowanPic_index_detail";

    const filterItem = async(task) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: [task.value]
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        return res.filter_result[0];
    };

    const filterItemD = async(value) =>{
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: [value]
        }
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        console.log("filterItemD", res);
        return res.filter_result[0];
    }

    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    const postWashTask = async(detailTask, data) => {
        let washTask = {
            name: "wash_corpus",
            value: "",
            config: JSON.stringify({
                bee_source: DETAIL_BEE_NAME,
                brick_id: JSON.parse(detailTask.config).brick_id,
                publish: true
            }),
            data: JSON.stringify(data),
            scheduled_at: Date.now()
        };
        let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
        return d.id;
    };

    const postDataToDereplicate = async(task) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            key: task.value
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
            };
            let result = [];

            for(let a of arr){
                if(!checkIn(a,result)){
                    result.push(a);
                }
            }
            return result;
        };

        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let filter = await filterItem(task);
            if (!filter) {
                Socket.log(`网页(url=${task.value})已经爬取过, 跳过`);
            } else {
                Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
                let baseUrl = task.value;

                let tab0 = new Tab(task.value, ["./business/script1.js"]);
                let pageCount = await tab0.run();
                Socket.log("当前图库有"+ pageCount + "张图片");


                let dataArray = [];
                for(let i = 1;i <= pageCount; i++){
                    let pageUrl = task.value;
                    pageUrl = pageUrl + "#p" + i;

                    console.log("pageUrl", pageUrl);
                    let filter = await filterItemD(pageUrl);

                    if(!filter){
                        console.log("爬过了 跳过下 也不想更新里面的评论的说");
                        continue;
                    }


                    let tab = new Tab(pageUrl, ["./business/script.js"]);

                    Socket.log(`开始爬取`);
                    let data = await tab.run();

                    Socket.log(`爬取完成,data=`, data);
                    data.comments = arrayDulicate(data.comments);

                    if(data.comments.length < 3){
                        console.log("评论有点少了 跳过吧");
                        continue;
                    }

                    dataArray.push(data);

                    task.data = JSON.stringify(data);
                    Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
                    await postDataToMessage(task, data);
                    Socket.log(`发送爬取结果到消息队列完成`);

                    Socket.log(`发起清洗任务`);
                    let task_id = await postWashTask(task, data);

                    Socket.log('发送到记数的地方')
                    await Task.countTask(task_id, DETAIL_BEE_NAME);

                    await postDataToDereplicate(task, {url: pageUrl});
                }

                Socket.log(`添加内容url(${baseUrl})到去重模块的历史集合`);

                Socket.log(`添加到去重模块成功`);

                task.data = JSON.stringify(dataArray);
                Socket.log(`提交爬取任务结果数据`);
                await Task.putTaskData(task);
                Socket.log(`提交爬取任务结果数据完成`);
            }

            Socket.emitEvent({
                event: "detail_item_finish",
                bee_name: task.name,
                bee_id: task.id
            });

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
        Socket.startHeartBeat(DETAIL_BEE_NAME);
        while (true) {
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
