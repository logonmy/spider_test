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
        "BB霜",
        "乳液",
        "保湿",
        "口红",
        "唇膏",
        "唇色",
        "底妆",
        "彩妆",
        "抗皱",
        "气垫",
        "洁面",
        "淡斑",
        "皂基",
        "眼妆",
        "眼影",
        "眼线",
        "眼霜",
        "祛斑",
        "祛痘",
        "美白",
        "腮红",
        "防晒",
        "面膜",
        "保湿水",
        "化妆刷",
        "化妆水",
        "卸妆水",
        "卸妆油",
        "卸妆膏",
        "去眼袋",
        "去角质",
        "抗氧化",
        "抗雾霾",
        "护手霜",
        "护肤品",
        "收敛水",
        "柔肤水",
        "柔软水",
        "洁面皂",
        "洁面粉",
        "洗面奶",
        "润唇膏",
        "淡痘印",
        "爽肤水",
        "睫毛膏",
        "祛痘印",
        "粉底液",
        "紧肤水",
        "腮红笔",
        "腮红膏",
        "腮红饼",
        "遮瑕膏",
        "防晒棒",
        "防晒霜",
        "固体散粉",
        "收敛毛孔",
        "无油面霜",
        "晒后修复",
        "氨基酸基",
        "洁面泡沫",
        "液体散粉",
        "淡斑精华",
        "清洁面膜",
        "皮肤保养",
        "皮肤护理",
        "皮肤清洁",
        "盒装面膜",
        "眼唇卸妆",
        "眼部护理",
        "眼部护肤",
        "美容养颜",
        "美容护肤",
        "美白精华",
        "美白面膜",
        "脸部清洁",
        "膜状面膜",
        "补水面膜",
        "防晒喷雾",
        "面部卸妆",
        "抗衰老精华",
        "淡化黑眼圈",
        "氨基酸洗面奶"
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
                if(re.url.indexOf("/zhuanlan.zhihu.com") > -1){
                    continue;
                }
                re.url = re.url.split("/answer")[0];

                await Queue.postDataToMessage("ZHH", JSON.stringify(re));
            }

        }

    })()

});
