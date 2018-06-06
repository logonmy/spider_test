require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll",
    "../api/queue",
    "../service/liteAjax"
], (Config, Http, Async, Task, Socket, Tab, File, Queue, liteAjax) => {

    const DETAIL_BEE_NAME = "qq_kandian_update";

    let brick_id = 16661;

    const filterItem = async (list) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            keys: list.map(item => item.articleid + "")

        };
        let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        console.log(res);
        return list.filter((item, i) => (res.filter_result[i]));
    };

    const postDataToMessage = async (task, data) => {
        console.log("post了一次");
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    const postWashTask = async (data) => {
        let washTask = {
            name: "wash_corpus",
            value: "",
            config: JSON.stringify({
                bee_source: DETAIL_BEE_NAME,
                brick_id: brick_id,
                publish: true
            }),
            data: JSON.stringify(data),
            scheduled_at: Date.now()
        };
        let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
        return d.id;
    };

    const postDataToDereplicate = async (value) => {
        let query = {
            partition: DETAIL_BEE_NAME,
            key: value + ""
        };
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    };

    let getComments = async(uin,feeds_id) => {
        return new Promise((resolve, reject) => {
            liteAjax("http://kandian.qq.com/qz_kandian_social/kandian_ext/GetCommentListV2?uin=" + uin + "&feeds_id=" + feeds_id + "&feedsType=12&startIndex=0&reqCount=20", function(d){
                resolve(d)
            })
        })
    }

    let getLists = async(uin) => {
        return new Promise((resolve, reject) => {
            liteAjax("http://kandian.qq.com/cgi-bin/social/getHomePage?uin=" + uin + "&pageNo=1&pageSize=10", function(d){
                resolve(d);
            })
        })
    }

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

    const runTask = async (task) => {
        brick_id = await getBrickId();
        try {
            let data = await getLists(task.uin);
            let lists = JSON.parse(data).result.articleinfos;
            for(let li of lists){

                let comment = await getComments(task.uin, li.feeds_id);
                comment = JSON.parse(comment);
                li.addComment = comment;
                await Async.sleep(1000);
                //File.append("qqkandiantest2", JSON.stringify(li) + "\n");
            }
            console.log("开始过滤");
            console.log(lists);
            lists = await filterItem(lists);
            console.log("添加到去重队列");
            console.log("并且");
            console.log("上传到消息队列");
            console.log("并且");
            console.log("送给陶翠城去洗碗");
            for(let li of lists){
                console.log(li);
                try{
                    if(li.addComment.result.retObj.commentList.length > 3){
                        console.log("到底是谁?");
                        console.log(li)
                        console.log(li.articleid);
                        await postDataToDereplicate(li.articleid);
                        await postDataToMessage(li);

                        Socket.log(`发起清洗任务`);
                        let task_id = await postWashTask(task, data);

                        Socket.log('发送到记数的地方')
                        await Task.countTask(task_id, DETAIL_BEE_NAME);

                    }
                }catch(e){
                    console.log("先这样吧");
                }
            }
            console.log("算是完事了");
        } catch (err) {
            console.log(err);

        }
    };

    (async () => {
        Socket.startHeartBeat(DETAIL_BEE_NAME);
        for (let s = 0; s < 468; s++) {
            let keyword = (await Queue.readDateFromMessage("qqKandian3", s)).result;
            keyword = JSON.parse(keyword);

            console.log(keyword)

            let miaomiaomiao = await runTask(keyword);
            console.log(miaomiaomiao, "？？？")
            await Async.sleep();

            if (s == 467) {
                s = -1;
            }

        }
    })();


});
