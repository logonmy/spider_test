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

    var parse = function (d) {
        while (typeof(d) == "string") d = JSON.parse(d);
        if (d.err_no) d = d.result;
        while (typeof (d) == "string") d = JSON.parse(d);
        if (typeof (d) == "object") return d[0];
        return d;
    }

    let run = async (i) => {
        let data;
        try {
            data = await Queue.getDataFromMessage("ZHH", i);
            console.log(data);
            data = JSON.parse(data.result)
            // data = parse(data);
        }catch (e){
            i++;
            console.log("第     ", i, "   完成 而且他是个终极无敌老BK");
            await run(i);
            await sleep(20);
            return;
        }
        console.log(data);

        let keyword = data.keyword;
        console.log(keyword);
        let url = "https://www.zhihu.com" + data.url;

        let tab = new Tab(url, ["./business/scriptQ.js"]);

        let remove = setTimeout(async function () {
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
        if(result == "timeout"){
            i++;
            console.log("第     ", i, "   完成 而且他是个老BK 超时了");
            await run(i)
            return;
        }

        try {
            for (let sm of result.question.similar_queries) {
                sm.keyword = keyword;
            }
        }catch(e){

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
