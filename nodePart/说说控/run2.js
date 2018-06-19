const File = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");
const readLine = require("lei-stream").readLine;
const getPage = require("../api/fetch").getPage;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

let getOnePage = async (href) => {
    href = "http://www.shuoshuokong.com" + href;
    let html = await getPage(href, true);
    let d = new jsdom.JSDOM(html);
    html = d.window.document.querySelector(".g-detail-font").innerHTML;
    File.appendFileSync("shuoshuo.txt", html);
    File.appendFileSync("shuoshuo.txt", "\n" + "==这是一个完美的分隔符==" + "\n");
}

let i = 0;
readLine("list2.txt").go(async(data, next)=> {
    i++;
    if(i < 320){
        console.log("jump", data);
    }else{
        console.log(data);
        await getOnePage(data);
        await sleep(2);
    }
    next();
})