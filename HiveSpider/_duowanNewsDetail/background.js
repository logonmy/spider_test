require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});


let templateData = {
    title: "",
    src: "",
    url: "",
    width: 0,
    height: 0,
    type: "",
    comments: [],
    created_at: new Date().getTime()
};

function ajax(url, method, postBody, headers, aSync, dataCallback, timeoutCallback, errorCallback, abortCallback) {
    if (method === undefined) {
        method = "GET";
    } else {
        method = method.toUpperCase();
    }
    if (!aSync) {
        aSync = true;
    }
    if (!headers) {
        headers = {};
    }

    let rqst = getRequestObj();
    if (rqst) {
        rqst.onreadystatechange = function () {
            if (rqst.readyState === 3 || rqst.readyState === 4) {
                if (dataCallback) {
                    dataCallback(rqst.responseText, rqst.readyState);
                }
            }
        };
        rqst.ontimeout = function () {
            if (timeoutCallback) {
                timeoutCallback();
            }
        };
        rqst.onerror = function () {
            if (errorCallback) {
                errorCallback();
            }
        };
        rqst.onabort = function () {
            if (abortCallback) {
                abortCallback();
            }
        };

        rqst.open(method, url, aSync);
        for (key in headers) {
            rqst.setRequestHeader(key, headers[key]);
        }

        if (method === "POST") {
            //rqst.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            rqst.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        rqst.send(postBody);
    }

    function getRequestObj() {
        if (window.ActiveXObject) {
            return new ActiveXObject('Microsoft.XMLHTTP');
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }
}

function liteAjax(url, callback, method, postBody, moreArgs) {
    ajax(url, method, postBody, {}, true, function (text, state) {
        if (state === 4) {
            if (callback) {
                callback(text);
            }
        }
    });
}

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

    const postDataToDereplicate = async(task) => {   //quchong
        let query = {
            partition: DETAIL_BEE_NAME,
            key: task.value
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    const runTask = async(task) => {
        try {
            Socket.log(`开始处理爬取任务,task=`, task);

            let filter = await filterItem(task);
            if(!filter){
                Socket.log(`网页(url=${task.value})已经爬取过, 跳过`);
            }else{
                let pageUrl = task.value;
                let arrayDulicate = (arr) => {
                    let resArr = [];
                    let j;
                    for(let i = 0; i < arr.length; i++){
                        for(j = i + 1;j < arr.length; j++){
                            if(arr[i] ===  arr[j]) {
                                break;
                            }
                        }
                        if(j === arr.length){
                            resArr.push(arr[i]);
                        }
                    }
                    return resArr;
                };

                Socket.log(`打开网页Tab(url=${task.value}), 注入爬取逻辑`);
                let tab0 = new Tab(task.value,["./business/script1.js"]);
                let pageCount = await tab0.run();
                Socket.log("当前图库有"+ pageCount + "张图片");
                let urlcn = (task.value).replace("com","cn") + "#p1";
                let json;
                liteAjax(urlcn,function (d) {
                    let html = document.createElement('html');
                    html.innerHTML = d;
                    let scripts = html.querySelectorAll("script");
                    let script = scripts[0].innerText;
                    let startIndex = script.indexOf('{"');
                    let stopIndex = script.indexOf(';');
                    let jsonstr = script.substring(startIndex,stopIndex);
                    json = JSON.parse(jsonstr);
                    let picInfo = json.picInfo;
                    for(let i = 0; i < picInfo.length; i++){
                        Socket.log(`****************`,i);
                        let data = templateData;
                        let contents = [];
                        Socket.log(`输出picInfo[] = `,picInfo[i]);
                        let info = picInfo[i];
                        data.title = info.title;
                        data.src = info.cover_url;
                        data.width = info.file_width;
                        data.height = info.file_height;
                        data.type = "img";
                        data.url = urlcn;
                        let commenturl = info.comment_url;   //从这个中获取uniqid +序列号
                        let uniqidStart = commenturl.indexOf("&uniqid=");
                        let uniqidEnd = commenturl.indexOf("&url");
                        let uniqid = commenturl.substring(uniqidStart,uniqidEnd);
                        let htmlidStart = commenturl.indexOf("gallery");
                        let htmlidEnd = commenturl.indexOf(".html&");
                        let htmlid = commenturl.substring(htmlidStart + 8,htmlidEnd);
                        let commentsUrl = "http://comment3.duowan.com/index.php?r=comment/comment&callback=comments&order=hot&noimg=true" + uniqid + "&domain=tu.duowan.com&url=%2Fgallery%2F" + htmlid + ".html";
                        Socket.log(`输出comment_url = `,commentsUrl);
                        liteAjax(commentsUrl,async function (commentdatas) {
                            Socket.log(`-------------`,i);
                            let comments = commentdatas.substring(commentdatas.indexOf("[{"),commentdatas.length-1);
                            comments = JSON.parse(comments);
                            for(let comment of comments){
                                contents.push(comment.contents);
                            }
                            data.comments = arrayDulicate(contents);
                            Socket.log(`输出单个data=`,data);

                            /* Socket.log(`发送爬取结果到消息队列topic = ${task.name}`);
                             await postDataToMessage(task,data);
                             Socket.log(`发送爬取结果到消息队列完成`);
                             Socket.log(`发起清洗任务`);
                             let task_id = await postWashTask(task,data);
                             Socket.log(`发送到记数的地方`);
                             await Task.countTask(task_id,DETAIL_BEE_NAME);*/

                            await postDataToDereplicate(task,{url: pageUrl});

                        });
                    }
                });
            }
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
