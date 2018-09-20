const Queue = require("../api/queue").Queue;
const File = require("fs");
const getLegoBrickAll = require("../api/lego").getLegoBrickAll;
const getLegoBrick = require("../api/lego").getBrick;
const getLegoBrickOne = require("../api/lego").getLegoBrickOne;
const readLine = require("lei-stream").readLine
const getPage = require("../api/fetch").getPage
const jsdom = require("jsdom")
    ;
(async () => {
    let legos = [];
    let count = 0;
    const init = async () => {
        return new Promise((resolve, reject) => {
            readLine("lego_100_0916.txt").go((data, next) => {
                let c = JSON.parse(data);
                c.R = c.R.split("||")
                let json = {};
                for (let text of c.R) {
                    try {
                        json = JSON.parse(text)
                    } catch (e) { }
                }
                if (json.url) {
                    count++;
                    let cIn = { lego_id: c.id, url: json.url }
                    legos.push(cIn);
                }
                next();
            }, () => {
                console.log(count)
                resolve();
            });
        })
    }
    await init();
    let sendAlready = new Set();
    for (let le of legos) {
        if(!sendAlready.has(le.url)){
            console.log(le)
            // await File.appendFileSync("allLego.txt", JSON.stringify(le) + "\n");
            // await Queue.postDataToMessage("yigemingzieryi", le.url)
        }
        sendAlready.add(le.url);
    }
})()