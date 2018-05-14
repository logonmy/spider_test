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

    const filterItems = async (task, data) => {
        let query = {
            partition: task.name,
            keys: data.items.map(item => item.url)
        };
        console.log(query)
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    };


    const postDetailTasks = async (data) => {
        for (let item of data.items) {
            let query = {
                name: "wx_public_detail",
                value: item,
                config: "{}",
                scheduled_at: Date.now()
            };
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/post`, query);
            Socket.log(`向Scheduler添加task=`, task);
        }
    };

    const postDataToDereplicate = async(task, data) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            key: task.value
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const runTask = async (task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);

            let strEncodeUnicode = (str) => {

                function checknum(value) {
                    var Regx = /^[A-Za-z0-9]*$/;
                    if (Regx.test(value)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                let result = ""
                for (let i = 0; i < str.length; i++) {
                    if (checknum(str[i])) {
                        result += str[i]
                    } else {
                        let ss = "%u" + str.charCodeAt(i).toString(16)
                        result += ss;
                    }
                }
                return result;
            }
            let word = strEncodeUnicode(task.value);


            let tab0Href = "https://www.newrank.cn/public/info/search.html?value=" + word;
            let tab0 = new Tab(tab0Href, ["./business/script1.js"]);
            let wxhaoma = await tab0.run();

            Socket.log("wxhaoma", wxhaoma)

            let tabHref = "https://www.newrank.cn/public/info/detail.html?account=" + wxhaoma;
            let tab = new Tab(tabHref, ["./business/script.js"]);

            Socket.log(`开始爬取`);
            let data = await tab.run();
            Socket.log(`爬取完成,data=`, data);

            Socket.log(`开始过滤`);
            await filterItems(task, data);
            Socket.log(`过滤掉已爬取的链接后,data=`, data);

            // Socket.log(`开始添加详情页爬取任务`);
            // await postDetailTasks(data);
            // Socket.log(`详情页爬取任务添加完成`);
            //
            // Socket.log("开始添加到去重队列");
            // await postDataToDereplicate(task,data);
            // Socket.log("添加完毕");
            //
            // task.data = JSON.stringify(data);
            // Socket.log(`提交爬取任务结果数据`);
            // await Task.putTaskData(task);
            // Socket.log(`提交爬取任务结果数据完成`);
            //
            // Socket.log(`上报爬取任务成功,task=`, task);
            // await Task.resolveTask(task);
            // Socket.log(`爬取任务完成`);
        } catch (err) {
            Socket.error("爬取失败,err=", err.stack);
            Socket.log(`上报爬取任务失败,task=`, task);
            await Task.rejectTask(task, err);
        }
    };

    (async () => {
        const BEE_NAME = "wx_xingbang_list";
        const SLEEP_TIME = 10000;
        Socket.startHeartBeat(BEE_NAME);
        while (true) {
            let task = await Task.fetchTask(BEE_NAME);
            if (task === null) {
                console.log("暂时没有任务")
                await Async.sleep(SLEEP_TIME);
                continue;
            }
            await runTask(task)
        }
    })();

});
