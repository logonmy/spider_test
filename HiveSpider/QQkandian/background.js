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
                resolve(d)
            })
        })
    }

    const runTask = async (task) => {
        try {
            let data = await getLists(task.uin);
            let lists = JSON.parse(data).result.articleinfos
            for(let li of lists){

                let comment = await getComments(task.uin, li.feeds_id)
                comment = JSON.parse(comment);
                li.addComment = comment;
                await Async.sleep(1000);
                File.append("qqkandiantest2", JSON.stringify(li) + "\n");
            }
            console.log(lists);
        } catch (err) {

        }
    };

    (async () => {
        Socket.startHeartBeat(DETAIL_BEE_NAME);
        for (let s = 0; s < 468; s++) {
            let keyword = (await Queue.readDateFromMessage("qqKandian3", s)).result;
            keyword = JSON.parse(keyword);

            console.log(keyword)

            await runTask(keyword);
            await Async.sleep(99999999999);

            if (s == 467) {
                s = -1;
            }

        }
    })();


});
