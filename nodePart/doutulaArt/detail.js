let articles = ["http://www.doutula.com/article/detail/8432231",
    "http://www.doutula.com/article/detail/6747574",
    "http://www.doutula.com/article/detail/1142550",
    "http://www.doutula.com/article/detail/3695184",
    "http://www.doutula.com/article/detail/9732424",
    "http://www.doutula.com/article/detail/9000398",
    "http://www.doutula.com/article/detail/4072572",
    "http://www.doutula.com/article/detail/2391363",
    "http://www.doutula.com/article/detail/3247720",
    "http://www.doutula.com/article/detail/8081848",
    "http://www.doutula.com/article/detail/9732424",
    "http://www.doutula.com/article/detail/9000398",
    "http://www.doutula.com/article/detail/4072572",
    "http://www.doutula.com/article/detail/2391363",
    "http://www.doutula.com/article/detail/3247720",
    "http://www.doutula.com/article/detail/8081848",
    "http://www.doutula.com/article/detail/3322430",
    "http://www.doutula.com/article/detail/2262083",
    "http://www.doutula.com/article/detail/4952778",
    "http://www.doutula.com/article/detail/6326931",
    "http://www.doutula.com/article/detail/8151079",
    "http://www.doutula.com/article/detail/7299644",
    "http://www.doutula.com/article/detail/7901781",
    "http://www.doutula.com/article/detail/2324075",
    "http://www.doutula.com/article/detail/3685093",
    "http://www.doutula.com/article/detail/3746934",
    "http://www.doutula.com/article/detail/2940575",
    "http://www.doutula.com/article/detail/3704751",
    "http://www.doutula.com/article/detail/1844785",
    "http://www.doutula.com/article/detail/6417667"]

let arts = new Set();
for (let a of articles) {arts.add(a)}
articles = [];
for (let a of arts) {articles.push(a)}
const getPage = require("../api/fetch").getPage;
const jsdom = require("jsdom");
const File = require("fs");
const jq = require("jquery");

(async () => {
    for (let i = 0; i < articles.length; i++) {
    //for (let i = 0; i < 1; i++) {
        let href = articles[i];
        let html = await getPage(href);
        let d = new jsdom.JSDOM(html);
        let $ = jq(d.window);
        let window = d.window;
        let document = window.document;

        let as = document.querySelectorAll(".artile_des a");
        let data = {
            href: href,
            title: $("h1 a").text(),
            pics: []
        }
        for(let a of as){
            let img = a.querySelector("img");
            let ad = {
                href: a.getAttribute("href"),
                alt: img.getAttribute("alt"),
                src: img.getAttribute("src")
            }
            data.pics.push(ad);
        }
        File.appendFileSync("tailcontext2.txt", JSON.stringify(data) + "\n");
        console.log(i, "已经跑完了");
    }
    console.log("完全跑完了");
})()