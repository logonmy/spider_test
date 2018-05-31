require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll",
    "../api/queue"
], (Config, Http, Async, Task, Socket, Tab, File, Queue) => {


    var task =[
        "化妆",
        "护唇",
        "护肤",
        "油皮",
        "洗头",
        "洗脸",
        "烂脸",
        "痘印",
        "痘痘",
        "痤疮",
        "眼袋",
        "祛皱",
        "粉刺",
        "美肌",
        "肌肤",
        "补水",
        "长痘",
        "除皱",
        "雀斑",
        "化妆棉",
        "卸甲水",
        "干燥肌",
        "手工皂",
        "抗衰老",
        "护唇膏",
        "护肤油",
        "敏感肌",
        "玻尿酸",
        "珍珠粉",
        "祛黑头",
        "精华油",
        "角质层",
        "身体乳",
        "隔离霜",
        "黑眼圈",
        "维生素C",
        "保湿面膜",
        "土豆面膜",
        "毛孔粗大",
        "睡眠面膜",
        "芦荟面膜",
        "补水喷雾",
        "闭口粉刺"
       ];

    (async () => {

        for (let s = 0; s < task.length; s++) {
            keyword = task[s];

            const lh = "https://www.zhihu.com/search?q=" + decodeURIComponent(keyword) + "&type=content";

            let lt = new Tab(lh, ["./business/scriptQ.js"]);
            let result = await lt.run();
            console.log(result);

            if (!result) console.log(keyword);

            for (let re of result) {
                re.keyword = keyword;
                await Queue.postDataToMessage("ZHDTopicQuestion", JSON.stringify(re));
            }

        }

    })()

});
