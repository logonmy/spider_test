const getLastestData = require("../api/file").getLastestData;
const jsdom = require("jsdom");
const http = require('http');
const iconv = require('iconv-lite');
const Http = require("../api/http").Http;
const getPage = require("../api/fetch").getPage;
const File = require("fs");
const RedisClient = require("../api/redis").RedisClient;
const redis = new RedisClient({host: "127.0.0.1", port: 6379});

const BEE_NAME = "doutulaQueue";

const filterItems = async (data) => {
    let query = {
        partition: "doutula_photo_id",
        keys: data.map((item) => {
            let sp = item.href.split("/");
            console.log("filter", sp[sp.length -1]);
            return sp[sp.length - 1];
        })
    };
    console.log(query);
    let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
    console.log(res);
    res = JSON.parse(res);
    data = data.filter((item, i) => (res.result.filter_result[i]));
    return data;
};
const postDataToDereplicate = async (data) => {
    let sp = data.split("/");
    sp = parseInt(sp[sp.length - 1]);
    let query = {
        partition: "doutula_photo_id",
        key: sp
    };
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
};

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

(async () => {
    while(true){
        for (let i = 1; i < 5; i++) {
            console.log("已经到了下一页了  ", i);
            let baseHref = "http://www.doutula.com/photo/list/?page=";
            let runHref = baseHref + i;
            let html = await getPage(runHref);
            let d = new jsdom.JSDOM(html);
            let window = d.window;
            let document = window.document;
            let as = document.querySelectorAll(".page-content.text-center a");
            let result = [];
            for (let a of as) {
                let img = a.querySelector("img[class^='img']");
                let re = {
                    title: img.getAttribute("alt"),
                    src: img.getAttribute("data-original"),
                    href: a.getAttribute("href")
                }
                File.appendFileSync("getcuichegn", JSON.stringify(re) + "\n");
                result.push(re);
            }
            result = await filterItems(result);
            console.log("filter完了    ^^^^^^^^^^^^^^^");
            for (let re of result) {
                let data = re.href;
                let sp = data.split("/");
                sp = parseInt(sp[sp.length - 1]);
                console.log(sp, "postdereplicate");

                await redis.connect();
                let test = await redis.sadd("doutula", sp);
                await redis.end();
                if(test == 0){
                    console.log("已经存在了 痕迹吧恐怖 明明filter过的");
                    continue;
                }else{

                    console.log("上传一条内容");
                    await postDataToDereplicate(re.href);
                }

                //console.log("上传一个");
                //await postDataToDereplicate(re.href);
                //await postDataToMessage(re);
                //await postWashTask(19179, re);
            }
        }
        console.log("开始漫长的等待");
        await sleep(12 * 60 * 60);
    }
})()