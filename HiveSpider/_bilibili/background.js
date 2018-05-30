require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {

    const LIST_BEE_NAME = "bilibili_index_update";
    const DETAIL_BEE_NAME = "bilibili_video_detail";

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

    const runTask = async() => {
        console.log("收到的是这样的任务");
        try {
            Socket.log(`打开网页B站点首页, 注入爬取逻辑`);
            let indexUrl = "https://www.bilibili.com/";
            let tab = new Tab(indexUrl, ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);

            Socket.log(`开始过滤`);
            await filterItems(data);Socket.log(`过滤掉已爬取的链接后,data=`, data);


            Socket.log(`开始添加详情页爬取任务`);
            await postDetailTasks(data);
            Socket.log(`爬取任务完成`);
        } catch(err) {
            Socket.error("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`);
        }
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

    (async() => {
        Socket.startHeartBeat(LIST_BEE_NAME);
        while (true) {
            brick_id = await getBrickId();
            if(brick_id){
                console.log(brick_id);
                await runTask()
            }
            await Async.sleep(20 * 60 * 1000);
        }
    })();

});
