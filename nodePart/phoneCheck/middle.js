const readLine = require("lei-stream").readLine;
const queue = require("../api/queue").Queue;
const jsdom = require("jsdom");
const getPage = require("../api/fetch").getPage;
const File = require("fs")

readLine("before.txt").go(async (data, next) => {
    data = JSON.parse(data);

    let haoma = [];
    for (let url of data.miao) {
        console.log(url);
        url = url.substring(1);
        let href = "https://www.chahaoba.com/" + encodeURIComponent(url);
        console.log(href);
        let html = await getPage(href)
        let d = new jsdom.JSDOM(html);
        let document = d.window.document;
        let li = document.querySelectorAll("ol li a")
        for(let l of li){
            haoma.push(l.getAttribute("title"));
        }
    }
    let rrrr= {
        title: data.title,
        haoma: haoma
    }
    console.log(rrrr);
    File.appendFileSync("middle.txt", JSON.stringify(rrrr) + "\n");
    next();
})