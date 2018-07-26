const getPage = require("../api/fetch").getPage
const File = require("fs");
const jsdom = require("jsdom");
const readLine = require("lei-stream").readLine;
const queue = require("../api/queue").Queue;

let sleep = async (s = 10) => {
    return new Promise(resolve => {
        setTimeout(resolve, s * 1000)
    })
}

readLine("xaa.txt").go(async (data, next) => {
    try {
        data = JSON.parse(data);
        console.log(data.word);
        // let href = "https://baike.baidu.com/item/" + encodeURIComponent(data.word);
        // let d = await getPage(href);
        // d = new jsdom.JSDOM(d);
        // let document = d.window.document;
        // let truename = document.querySelector("h1").innerHTML;
        // console.log(truename);
        // data.word = truename;
        // File.appendFileSync("fhj4342134y.txt", JSON.stringify(data) + "\n");
        await queue.postDataToMessage("wobianhuanyixianame", data);
        console.log(data);
    } catch (e) {
        console.log(e);
    }
    next();
});

(async () => {
    let data = await queue.getDataFromMessage("wobianhuanyixianame");
    console.log(data.word);
})()