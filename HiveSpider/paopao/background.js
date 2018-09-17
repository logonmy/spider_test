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
    "../api/fileControll",
], (Config, Http, Async, Task, Socket, Tab, SaveFile, FileControll) => {

    const DETAIL_BEE_NAME = "paopao_detail";

    const filterItem = async (data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: [data.id]
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        return res.filter_result[0];
    };

    const postDataToMessage = async (task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    const postWashTask = async (detailTask, data) => {
        let washTask = {
            name: "wash_corpus",
            value: "",
            config: JSON.stringify({
                bee_source: DETAIL_BEE_NAME,
                brick_id: JSON.parse(detailTask.config).brick_id,
                publish: false
            }),
            data: JSON.stringify(data),
            scheduled_at: Date.now()
        };
        let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
        return d.id;
    };

    const postDataToDereplicate = async (da) => {
        try {
            console.log("开始去重");
            let query = {
                partition: DETAIL_BEE_NAME,
                key: da.id
            };
            await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
        } catch (e) {
            console.log(e)
        }
    };

    const badWord = ["互助", "回访", "泡泡", "加油棒", "冲榜", "领奖", "上班", "签到", "领取任务", "打卡", "展开", "代号", "版本过低"]

    const isClean = (data) => {
        for (let b of badWord) {
            if (data.title && data.title.indexOf(b) > -1) {
                return false;
            }
            for (let c of data.comments) {
                if (c && c.indexOf(b) > -1) {
                    c = null;
                }
            }
        }
        let temp = [];
        for (let c of data.comments) {
            if (c) temp.push(c);
        }
        for (let i of data.imgs) {
            if (!i) return false;
        }
        data.comments = temp;

        return true;
    }

    const runTask = async (task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);
            console.log(task.value);
            if(!task.value){
                throw new Error("这value也没有值啊");
            }            
            if(task.value.indexOf("paopao") < 0){
                task.value = task.value + "?select=paopao";
            }
            Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
            let tab = new Tab(task.value, ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            console.log(data);
            for (let da of data) {
                if (isClean(da)) {
                    Socket.log("开始filter");
                    let filter = await filterItem(da);
                    if (!filter) {
                        Socket.log("该内容已存在", da.id);
                    } else {
                        let config = JSON.parse(task.config);
                        da.brick_id = config.brick_id;

                        Socket.log("发起清洗任务");
                        console.log(task, da);
                        let task_id = await postWashTask(task, da);
                        Socket.log('发送到记数的地方')
                        await Task.countTask(task_id, DETAIL_BEE_NAME);
                        task.data = JSON.stringify(da);
                        Socket.log(`提交爬取任务结果数据`);
                        await Task.putTaskData(task);
                        Socket.log(`提交爬取任务结果数据完成`);
                        
                        Socket.log("开始添加到去重队列")
                        await postDataToDereplicate(da);
                        Socket.log(`添加到去重模块成功`);
                    }
                }else{
                    Socket.log("该内容 不是很鸡儿干净的 你懂 然后就被过滤掉了");
                    
                }
            }
            if (task.scheduled_at == 9999999999999) {
                Socket.emitEvent({
                    event: "detail_item_finish",
                    bee_name: task.name,
                    task_id: task.id
                });
            }

            console.log("爬取成功");
            Socket.log(`上报爬取任务成功,task=`, task);
            await Task.resolveTask(task);
            Socket.log(`爬取任务完成`);

        } catch (err) {
            console.log("爬取失败");
            console.log(err);
            Socket.error("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async () => {
        Socket.startHeartBeat(DETAIL_BEE_NAME);
        while (true) {
            console.log("###########################")
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
