require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll", "config", "../service/tab"], function (fileControll, config, Tab) {
    (async () => {
        let hrefs = [];
        let topics = ["hulianwang",
            "kexue",
            "lishi",
            "junshi",
            "shuma",
            "renwen",
            "chongwu",
            "xingzuo",
            "gaoxiao",
            "qinggan",
            "guangbo",
            "yangsheng",
            "yinyue",
            "dianshiju",
            "dianying",
            "zongyi",
            "sheying",
            "jianshen",
            "tiyu",
            "meishi",
            "lvyou",
            "caijing",
            "yiliao",
            "dushu",
            "fangdichan",
            "qiche",
            "shishang",
            "meizhuang",
            "jiaoyu",
            "dongman",
            "youxi",
            "falv",
            "muying",
            "yule",
            "shoucang",
            "kejiguancha",
            "hq",
            "sjmeixue"]
        let time = ["day", "week", "month"];
        for(let t of topics){
            for(let s of time ){
                hrefs.push("http://v6.bang.weibo.com/czv/" + t + "?period=" + s);
            }
        }
        console.log(hrefs);

        for(let href of hrefs){
            console.log("现在在跑的页面是", href);
            let tab = new Tab(href, ["./business/script.js"]);
            let da = await tab.run();
            console.log(da);
            for(d of da){
                await fileControll.append("weiboMillion", JSON.stringify(d) + "\n");
            }
        }
    })()

});