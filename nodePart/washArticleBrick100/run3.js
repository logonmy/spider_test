const getLegoBrickAll = require("../api/lego").getLegoBrickAll;
const getLegoBrick = require("../api/lego").getBrick;
const getLegoBrickOne = require("../api/lego").getLegoBrickOne;
const readLine = require("lei-stream").readLine
const getPage = require("../api/fetch").getPage
const jsdom = require("jsdom")
const getLego = require("../api/lego").getLego
const putLego = require("../api/lego").putLego
const importLego = require("../api/lego").importLego
    ;
const sleep = async (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve()
        }, time * 1000)
    })
}
let count = 0;
let legos = [];

let alreadySuck = new Set();
let temp = {};
let baohan = {}
const init = async () => {
    return new Promise((resolve, reject) => {
        readLine("allLego.txt").go((data, next) => {
            try {
                data = JSON.parse(data);
                let host = (data.url.split("//")[1]).split("/")[0]
                if(baohan[host]){
                    baohan[host]++;
                }else{
                    baohan[host] = 1;
                }
            } catch (e) { }
            next();
        }, () => {
            console.log(baohan)
            readLine("resultSecond.txt").go((data, next) => {
                data = JSON.parse(data);
                alreadySuck.add(data.url);
                temp[data.url] = data.brief;
                next();
            }, () => {
                resolve();
            })
        });
    })
}


(async () => {
    await init();
    for (let lego of legos) {
        let text = await suckP(lego.url);
        if (text) {
            count++;
            // try {
            //     text = text.trim();
            //     console.log(text);
            //     console.log(lego);
            //     let content = await getLego(lego.lego_id);
            //     let r = JSON.parse(content.R);
            //     r.brief = text;
            //     content.R = JSON.stringify(r);
            //     await putLego(content);
            //     await importLego(lego.lego_id);
            // } catch (e) {
            //     console.log(e);
            // }
        }
    }
})()

const suckP = async (url) => {
    let text = ""
    if (alreadySuck.has(url)) {
        return temp[url];
    } else {

    }



    // alreadySuck.add(url);
    // temp[url] = text;
    return text;
}