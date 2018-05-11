const readLine = require("lei-stream").readLine;
const addLego = require("./api/lego").addLego;
const deleteLego = require("./api/lego").deleteLego;
const Http = require("./api/http").Http;

let i = 1;

let sleep = async (s= 10) => {
    return new Promise(resolve => {setTimeout(resolve, s*1000)})
}


readLine("zuiyou.txt").go(async(data, next) => {
    console.log("#############################################")
    console.log("读取文件第 " , i , " 行");

    data = JSON.parse(data);
    let addBack = await addLego("最右_" + data.topic, "最右_" + data.topic + "的简介");
    addBack = JSON.parse(addBack);
    console.log(addBack);
    console.log("建立brick成功, brick_id为 ",addBack.result.id);
    let result = {
        "name":"zuiyou_history",
        "value": data.topic,
        "config": JSON.stringify({"num_item_limit": 32, keyword: data.topic, brick_id: addBack.result.id}),
        "scheduled_at": new Date().getTime()
    }
    console.log("发布任务 最右话题", result.value);


    let re = await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", result);
    console.log(re)
    console.log("任务推送成功")
    console.log("#############################################")
    await sleep(300);
    next();
})