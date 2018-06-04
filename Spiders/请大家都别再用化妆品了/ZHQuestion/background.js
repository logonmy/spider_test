require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll",
    "../api/queue",
], (Config, Http, Async, Task, Socket, Tab, File, Queue) => {

    let i = 0;

    let run = async (i) => {
        let data = await Queue.getDataFromMessage("ZHH", i);
        data = data.result;
        console.log(data);
        data = JSON.parse(data);
        console.log(data);

        let keyword = data.keyword;
        console.log(keyword);
        let url = "https://www.zhihu.com" + data.url;

        let tab = new Tab(url, ["./business/scriptQ.js"]);

        let remove = setTimeout(async function(){
            tab.close();
            i++;
            console.log("第     ", i, "   完成 而且他老BK中的老BK 真是🐶");
            await run(i)
            return;
        }, 45000)

        let result = await tab.run();
        clearTimeout(remove);
        if (!result) {
            i++;
            console.log("第     ", i, "   完成 而且他是个老BK");
            await run(i)
            return;
        }
        console.log(result);

        for (let sm of result.question.similar_queries) {
            sm.keyword = keyword;
        }

        await Queue.postDataToMessage("ZHURES", JSON.stringify(result));
        i++;
        console.log("第     ", i, "   完成");
        await run(i)

    }
    (async () => {
        await run(i);
    })()
});
