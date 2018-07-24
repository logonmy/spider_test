const jsdom = require("jsdom");
const getPage = require("../api/fetch").getPage;
const File = require("fs");
let startId = 10167162;
(async () => {

    let one = async (id) => {
        try {
            let html = await getPage("https://www.gexing.com/wenzi/" + id + ".html");
            let d = new jsdom.JSDOM(html)
            let document = d.window.document;

            let text2 = document.querySelector(".edui-filter-align-center").textContent;
            console.log(text2);
            File.appendFileSync("result.txt", text2 + "\n");
        } catch (e) {
            console.log(e);
            console.log("nmsl wsnd");
        }
    }

    while (true) {
        await one(startId);
        startId = startId - 1;
        console.log("start", startId);
    }
})()

