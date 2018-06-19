const getLastestData = require("../api/file").getLastestData;
const jsdom = require("jsdom");
const http = require('http');
const iconv = require('iconv-lite');
const Http = require("../api/http").Http;
const File = require("fs");

const BEE_NAME = "madanQueue";
const postDataToMessage = async (data) => {
    await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${BEE_NAME}`, data);
};

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const postWashTask = async (brick_id, data) => {
    let washTask = {
        name: "wash_corpus",
        value: "",
        config: JSON.stringify({
            bee_source: BEE_NAME,
            brick_id: brick_id,
            publish: true
        }),
        data: JSON.stringify(data),
        scheduled_at: Date.now()
    };

    let d = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
    d = JSON.parse(d).result;
    return d.id;
};

const get = (href) => {
    return new Promise((resolve, reject) => {
        http.get(href, function (res) {
            let length = 0;
            let arr = [];
            res.on("data", function (chunk) {
                arr.push(chunk);
                length += chunk.length;
            });
            res.on("end", function () {
                let data = Buffer.concat(arr, length);
                let change_data = iconv.decode(data, 'gb2312');
                resolve(change_data.toString());
            })
        });
    })

}
let first = true;
let running = "";

let xmrUpdate = async (id) => {
    console.log("----------------------------");
    let baseU = "http://md.itlun.cn/";
    let href = baseU + id;
    console.log("现在在跑这个页面", href);
    let html = await get(href);
    let d = new jsdom.JSDOM(html);
    let window = d.window;
    let document = window.document;
    let pic = document.querySelector(".divcss5-max-width img");
    let url = document.querySelector(".divcss5-max-width a").getAttribute("href");
    if (url.indexOf("itlun") > -1) url = false;
    let data = {
        title: pic.getAttribute("alt"),
        src: pic.getAttribute("src"),
        href: href
    }
    data.title = data.title.replace("_金馆长妈蛋表情网md.itlun.cn", "");
    if (first) {
        first = false;
        return url;
    }
    console.log(data);
    File.appendFileSync(running, JSON.stringify(data) + "\n");
    await postDataToMessage(data);
    await postWashTask(19179, data);
    return url;
}

(async () => {
    while(true){
        let ary = ["madan_dhrw.txt", "madan_gif.txt", "madan_jgz.txt", "madan_xbq.txt", "madan_xmr.txt"];
        for(let fn of ary){
            first = true;
            running = fn;
            let data = await getLastestData(fn);
            data = JSON.parse(data);
            console.log(data);
            let id = data.href.split("un.cn/")[1];
            console.log("上次跑到这里", id);
            while (id) {
                id = await xmrUpdate(id);
            }
        }
        await sleep(12 * 60 * 60);
    }



})()