const getPage = require("../api/fetch").getPage;
const Queue = require("../api/queue").Queue;
const jq = require("jquery");
const jsdom = require("jsdom");
const File = require("fs");


//http://t.cn/RmvFJn5
let url = "http://www.flvcd.com/parse.php?format=&kw=" + "http%3A%2F%2Ft.cn%2FRmvFJn5";
let i=0;
(async () => {
    while(true){

        let startTime = Date.now();

        let html = await getPage(url);
        let d = new jsdom.JSDOM(html);
        let window = d.window;
        let document = window.document;
        let as = document.querySelectorAll("a");
        let href;
        for(let a of as){
            href = a.getAttribute("href");
            if(href.indexOf("flvcd") > -1 || href.length < 10) {
                continue;
            }
            console.log(href, i++);
            break;
        }
        let endTime = Date.now();
        File.appendFileSync("result.txt", JSON.stringify({
            startTime: startTime,
            endTime: endTime,
            last: (endTime - startTime)/1000 + "s",
            result: href
        }) + "\n");

    }


})()