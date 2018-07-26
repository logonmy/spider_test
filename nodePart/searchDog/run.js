const getPage = require("../api/fetch").getPage
const File = require("fs");
const queue = require("../api/queue").Queue;

let sleep = async (s = 10) => {
    return new Promise(resolve => {
        setTimeout(resolve, s * 1000)
    })
}

(async () => {
    while(true){
        let data = await queue.getDataFromMessage("searchDog");
        console.log(data);
        data = JSON.parse(data.result);
        console.log(data.word);
        let href = "http://zhishu.sogou.com/index/searchHeat?kwdNamesStr=" + encodeURIComponent(data.word) + "&timePeriodType=MONTH&dataType=SEARCH_ALL&queryType=INPUT"
        let d = await getPage(href);
        try {
            console.log(data.word, "             ", d.indexOf("root.SG.data") > -1);
            d = d + "";
            let code = d.split("(function (root) {")[1].split("}(this));")[0];
            let root = {};
            eval(code);
            console.log(root.SG.data.infoList[0].avgPv);
            data.searchDog = root.SG.data.infoList[0].avgPv;
            File.appendFileSync("searchDogResult.txt", JSON.stringify(data) + "\n");
        } catch (e) {
            console.log(data.word, "             ", d);
            try{
                await queue.postDataToMessage("searchDog.txt", data);
            }catch(e){
                console.log(data,"这我也没办法了, 晕");
            }
        }
        await sleep(0.5);
    }
})()