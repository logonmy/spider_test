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

    const runTask = async (task) => {
        "https://question.jd.com/question/getQuestionAnswerList.action?page=1&productId=4712531"
        "https://question.jd.com/question/getAnswerListById.action?page=1&questionId=5426037"
    };

    (async () => {

        var ar = ["面膜"];
        for(let c of ar){
            let d = encodeURIComponent(c);
            for(let page = 175;page < 200;page= page +2){
                let url = "https://search.jd.com/Search?keyword=" + d +"&enc=utf-8&wq=" + d + "&stock=1&page=" + page;
                let t = new Tab(url, ["./business/script.js"]);
                let data = await t.run();
                console.log(data);
                for(let d of data){
                    d.keyword = c;
                    await Queue.postDataToMessage("JDTEST", JSON.stringify(d))

                }
            }

        }

    })();

});
