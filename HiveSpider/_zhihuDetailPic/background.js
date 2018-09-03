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
], (Config, Http, Async, Task, Socket, FileControll, Tab) => {

    const DETAIL_BEE_NAME = "zhihu_index_detail";

    const filterItem = async (task) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: [task.value]
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
                publish: true
            }),
            data: JSON.stringify(data),
            scheduled_at: Date.now()
        };
        await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask)
    };

    const postDataToDereplicate = async (task) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            key: task.value
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    (async () => {
        const url = "https://www.zhihu.com/question/275258545/answer/426831029";
        chrome.tabs.create({
            url: url,
            selected: true
        }, function (tab) {
            console.log(tab)
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tabI) {
                if (changeInfo.status == 'complete' && tabId == tab.id) {
                    chrome.tabs.executeScript(tab.id, {
                        file: "./static/html2canvas.min.js"
                    }, function () {
                        chrome.tabs.executeScript(tab.id, {
                            file: "./static/canvans2image.js"
                        }, function () {
                            chrome.tabs.executeScript(tab.id, {
                                file: "./business/script.js"
                            })
                        })
                    })
                }
            })
        })
    })();
});
