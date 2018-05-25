require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {

    let a = [
        "http://www.sina.com.cn/",
        "http://news.sina.com.cn/",
        "http://mil.news.sina.com.cn/",
        "http://news.sina.com.cn/society/",
        "http://news.sina.com.cn/world/",
        "http://finance.sina.com.cn/",
        "http://finance.sina.com.cn/stock/",
        "http://finance.sina.com.cn/fund/",
        "http://finance.sina.com.cn/forex/",
        "http://tech.sina.com.cn/",
        "http://mobile.sina.com.cn/",
        "http://tech.sina.com.cn/discovery/",
        "http://zhongce.sina.com.cn/",
        "http://sports.sina.com.cn/",
        "http://sports.sina.com.cn/nba/",
        "http://sports.sina.com.cn/g/premierleague/",
        "http://sports.sina.com.cn/csl/",
        "http://ent.sina.com.cn/",
        "http://ent.sina.com.cn/star/",
        "http://ent.sina.com.cn/film/",
        "http://astro.sina.com.cn/",
        "http://auto.sina.com.cn/",
        "http://dealer.auto.sina.com.cn/price/",
        "http://db.auto.sina.com.cn/",
        "http://auto.sina.com.cn/newcar/index.d.html",
        "http://blog.sina.com.cn/",
        "http://zhuanlan.sina.com.cn/",
        "http://blog.sina.com.cn/lm/history",
        "http://weather.sina.com.cn/",
        "http://video.sina.com.cn/",
        "http://ent.sina.com.cn/zongyi/",
        "http://vr.sina.com.cn/",
        "http://video.sina.com.cn/l/pub",
        "http://www.leju.com/#source=pc_sina_tydh1&source_ext=pc_sina",
        "http://esf.leju.com/?bi=tg&type=sina-pc&pos=index-dh",
        "http://jiaju.sina.com.cn/",
        "http://collection.sina.com.cn/",
        "http://fashion.sina.com.cn/",
        "http://eladies.sina.com.cn/",
        "http://health.sina.com.cn/",
        "http://baby.sina.com.cn/",
        "http://edu.sina.com.cn/",
        "http://edu.sina.com.cn/gaokao",
        "http://gongyi.sina.com.cn/",
        "http://fo.sina.com.cn/",
        "http://photo.sina.com.cn/",
        "http://book.sina.com.cn/",
        "http://tousu.sina.com.cn/",
        "http://sifa.sina.com.cn/",
        "https://weibo.com/",
        "http://city.sina.com.cn/",
        "http://www.51xiancheng.com/",
        "http://sh.sina.com.cn/",
        "http://travel.sina.com.cn/",
        "http://cul.news.sina.com.cn/",
        "http://lottery.sina.com.cn/",
        "http://golf.sina.com.cn/",
        "http://games.sina.com.cn/",
        "http://mail.sina.com.cn/",
        "http://jiaoyi.sina.com.cn/jy/",
        "https://trade.xincai.com/web/promote",
        "http://gov.sina.com.cn/",
        "http://chexian.sina.com/",
        "http://game.weibo.com/",
        "http://show.sina.com.cn/",
        "http://search.sina.com.cn/?c=more",
        "http://help.sina.com.cn/",
        "http://news.sina.com.cn/guide/"]


    const runTask = async() => {
         let  i = 0

        let run = async(i) => {
            let url = a[i]
            let tab = new Tab(url, ["./business/script.js"]);

            let timeout = setTimeout(async function(){
                await run(i)
            }, 20000)

            let data = await tab.run();
            clearTimeout(timeout);
            console.log(data);
            for(let da of data.data){
                console.log("append", da);
                await File.append("sinaIndexPageTitle", da + "\n");
            }
            i = i+ 1
            await run(i)
        }

        await run(i)

    };

    runTask();

});
