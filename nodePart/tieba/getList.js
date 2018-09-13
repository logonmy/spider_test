const jsdom = require("jsdom");
var iconv = require('iconv-lite');
var request = require('request');
const File = require("fs")


let hrefT = "http://tieba.baidu.com/sign/index?kw=lol&type=3&pn=";

const getPage = (href) => {
    return new Promise((resolve, reject) => {
        request.get(href).pipe(iconv.decodeStream('gbk')).collect(function (err, body) {
            resolve(body)
        });
    })
}

(async () => {
    for (let i = 1; i < 101; i++) {
        let href = hrefT + i;
        let html = await getPage(href)
        let d = new jsdom.JSDOM(html);
        let window = d.window;
        let document = window.document;

        let row = document.querySelectorAll(".j_rank_row");
        for (let r of row) {
            let membersNum = r.querySelector(".forum_member").innerHTML;
            let name = r.querySelector(".forum_name a").innerHTML;
            let href = r.querySelector(".forum_name a").getAttribute("href");
            membersNum = parseInt(membersNum);
            if (membersNum > 10000) {
                File.appendFileSync("lists.txt", JSON.stringify({
                    membersNum: membersNum,
                    name: name,
                    href: href
                }) + "\n")
            }
        }
        console.log(i)
    }
})()