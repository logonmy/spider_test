const getPage = require("../api/fetch").getPage;
const jsdom = require("jsdom");
const File = require("fs");
const readLine = require("lei-stream").readLine;

(async () => {
    const baseHref = "http://www.doutula.com/article/list/";
    let href;
    for (let i = 0; i < 557; i++) {
        href = baseHref + "?page=" + i;
        if (i == 0) href = baseHref;
        let html = await getPage(href);
        let d = new jsdom.JSDOM(html);
        let window = d.window
        let document = window.document;
        let as = document.querySelectorAll("a");
        for (let a of as) {
            try {
                let href = a.getAttribute("href");
                if (href.indexOf("article/detail/") > -1) {
                    File.appendFileSync("articleHrefs.txt", href + "\n");
                }
            } catch (e) {
                //console.log(e);
                //console.log("whatever");
            }
        }
        console.log("已经跑到第", i, "个已经完了");
    }
    console.log("完全跑完了");
    let set = new Set();
    readLine("articleHrefs.txt").go((data, next) => {
        set.add(data);
        next();
    }, () => {
        console.log("文件处理完了");
        for (let s of set) {
            File.appendFileSync("articleHrefs2.txt", s + "\n");
        }
    })
})()
