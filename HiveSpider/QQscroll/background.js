require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {
    const BEE_NAME = "QQscroll";
    const DETAIL_BEE_NAME = "QQscroll";
    const indexUrl = "http://news.qq.com/articleList/rolls/";

    const sleep = (s = 5) => {return new Promise(resolve => setTimeout(resolve, s * 1000))};
    let brick_id;

    const filterItems = async(data) => {
        let query = {
            partition: BEE_NAME,
            keys: data.items.map(item => item.url)
        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        console.log(res);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
        console.log(data);
    };

    const postDataToMessage = async(data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${BEE_NAME}`, data);
    };

    const postWashTask = async(detailTask, data) => {
        let washTask = {
            name: "wash_corpus",
            value: "",
            config: JSON.stringify({
                bee_source: BEE_NAME,
                brick_id: brick_id,
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
            partition: BEE_NAME,
            key: task.url
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };
    const getBrickId = async() => {
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
        for(let da of data){
            if(da.name == trueName){
                return da.id;
            }
        }

        return false;

    }

    let runTask = async() => {
        console.log("开始任务了");
        try{
            let tab = new Tab(indexUrl, ["./business/script.js"]);
            console.log("开始爬取");
            let data = await tab.run();

            await filterItems(data);
            console.log(`过滤掉已爬取的链接后,data=`, data);

            for(let da of data.items){
                console.log(da);
                await postDataToMessage(da)

                Socket.log(`发起清洗任务`);
                let task_id = await postWashTask(task, data);

                Socket.log('发送到记数的地方')
                await Task.countTask(task_id, DETAIL_BEE_NAME);

                await postDataToDereplicate(da);
            }

        }catch(e){
            console.log(e);
            console.log("something Wrong");
        }
    }

    (async()=> {
        Socket.startHeartBeat(BEE_NAME);
        while(true){
            brick_id = await getBrickId();
            if(brick_id){
                console.log(brick_id);
                await runTask()
            }
            await Async.sleep(20 * 60 * 1000);
        }
    })()

});
