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
    "../service/tab",
    "../api/fileControll",
    "../api/lego",
    "../api/legoUtil"
], (Config, Http, Async, Task, Socket, Tab, FileControll, Lego, getTypeOfR) => {
    let lego_ids = Config.lego_ids;
    console.log(lego_ids)
    let lastLego;

    let urlSet = new Set();
    let urlTemp = {};

    const sleep = async (time) => {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve()
            }, time * 1000)
        })
    }

    const runTask = async (url) => {
        try {
            let tab = new Tab(url, ["./business/script.js"], 10000);
            let data = await tab.run();
            tab.remove();
            console.log("-----------")
            console.log(data);
            console.log("-----------")
            return data;
        } catch (err) {

        }
    };

    const CheckArticle = (lego) => {
        let type = getTypeOfR(lego.R);
        if (type == 4) return true;
        return false;
    }

    const getBrief = (lego) => {
        let text = JSON.stringify(lego);
        if (text.indexOf("brief") < 0) {
            return null;
        }
        let r = lego.R.split("||");
        let json;
        for (let s of r) {
            try {
                json = JSON.parse(s);
                console.log(json, "json")
                if (json.brief || json.brief == "") {
                    return json.brief
                }
            } catch (e) { }
        }
        return null;
    }

    const getUrl = (lego) => {
        let r = lego.R.split("||");
        let json;
        for (let s of r) {
            try {
                json = JSON.parse(s);
                if (json.url) {
                    return json.url
                }
            } catch (e) { }
        }
        return null;
    }

    const addBrief = (lego, brief) => {
        let isArt = CheckArticle(lego);
        if (!isArt) {
            return null;
        }
        let r = lego.R.split("||");
        let json;
        let needed = "";
        for (let s of r) {
            try {
                json = JSON.parse(s);
                if (json.url) {
                    json.brief = brief;
                    s = JSON.stringify(json)
                }
            } catch (e) { }
            needed = needed + s + "||"
        }
        console.log(needed)
        needed = needed = needed.substring(0, needed.length - 2);
        lego.R = needed;

        try {
            let c = JSON.parse(lego.C);
            let temp = [];
            for (let ci of c) {
                if (ci) {
                    temp.push(ci);
                }
            }
            lego.C = JSON.stringify(temp);
        } catch (e) {
            console.log("about c got error", e);
        }

        return lego;
    }

    (async () => {
        if (lego_ids) {
            let d = lego_ids;
            for (let c of d) {
                try {
                    c = await Lego.getLego(c);
                    let isArt = CheckArticle(c)
                    if (!isArt) {
                        console.log("不是文章卡片");
                        continue;
                    }
                    console.log("-----------------------------------------------");
                    let brief = getBrief(c)
                    console.log(brief, "原有的brief");
                    if (brief) {
                        console.log(brief, " 已经拥有了这样的brief");
                        continue;
                    }

                    let url = getUrl(c);
                    if (!url) {
                        console.log(c)
                        console.log("莫名其妙提取url失败了");
                        continue;
                    }
                    console.log("进入的lego", c)
                    let text = await runTask(url);
                    if (text && text != "timeout") {
                        let lego = addBrief(c, text);
                        console.log("出来的lego", lego);
                        let d = await Lego.putLego(lego);
                        console.log(d);
                        d = await Lego.importLego(c.id);
                    }else{
                        console.log("不存在text");
                    }
                } catch (e) {
                    console.log(e, "first part");
                }
            }

        } else {
            let d = await Lego.readLegoFirst(100);
            lastLego = d[0].id;
            lastLego = 70569079;
            console.log(lastLego);
            while (true) {
                try {
                    console.log("###########################")
                    let d = await Lego.getLegoUntil(100, lastLego);
                    if (d && d[0] && d[0].id) {
                        lastLego = d[0].id;

                        for (let c of d) {
                            let isArt = CheckArticle(c)
                            if (!isArt) {
                                console.log("不是文章卡片");
                                continue;
                            }
                            let brief = getBrief(c)
                            console.log(brief, "bb")
                            if (brief) {
                                console.log(brief, " 已经拥有了这样的brief");
                                continue;
                            }

                            let url = getUrl(c);
                            if (!url) {
                                console.log(c)
                                console.log("莫名其妙提取url失败了");
                                continue;
                            }
                            console.log("进入的lego", c)
                            let text = await runTask(url);
                            if (text && text != "timeout") {
                                let lego = addBrief(c, text);
                                console.log("出来的lego", lego);
                                let d = await Lego.putLego(lego);
                                console.log(d);
                                d = await Lego.importLego(c.id);
                            }else{
                                console.log("不存在text")
                            }
                        }
                    } else {
                        console.log("暂时没有新内容进入");
                    }

                    await sleep(4);
                } catch (e) {
                    console.log(e)
                }
            }
        }
    })();
});
