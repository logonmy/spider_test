//仅支持单进程
const io = require("socket.io-client");
const socket = io("http://ws.api.talkmoment.com:51179");
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

socket.on("signRes", (data) => {
    myEmitter.emit(data.echo, data)
})

const AskSign = async (url, params, echo) => {
    return new Promise((resolve, reject) => {
        socket.emit("signReq", {
            url: url,
            params: params,
            echo: echo,
            init: "true"
        });
        let timeout = setTimeout(() => {
            reject("timeout, 超出三秒了")
        }, 3000)
        myEmitter.once(echo, (data) => {
            clearTimeout(timeout);
            resolve(data);
        })
    })
}


let recommendAll = async (cid) => {
    let listResult = [];
    let offset;
    let sign = await AskSign("https://api.izuiyou.com/topic/recommend_page", {offset: 0, cid: cid}, "recommendAll");
    let result = await Http.call(sign.url, sign.params);
    result = JSON.parse(result);

    offset = result.data.offset;
    let more = parseInt(result.data.more);
    listResult = listResult.concat(result.data.list);

    while(more){
        console.log("一个请求完成");
        let ll = await recommendOne(offset, cid);
        listResult = listResult.concat(ll.data);
        console.log(ll.more)
        more = ll.more;
        offset = ll.offset;
    }

    return listResult;
}

let recommendOne = async (offset,cid) => {
    await sleep(2);
    let params = {
        offset: offset,
        cid: cid
    }
    let echo = "recommendOne";
    let sign = await AskSign("https://api.izuiyou.com/topic/recommend_page", params, echo);
    let result = await Http.call(sign.url, sign.params)
    result = JSON.parse(result);
    return {
        data: result.data.list,
        offset: result.data.offset,
        more: result.data.more
    }
};


let topicDetail = async (topicId) => {
    let params = {
        tid: topicId
    }
    let echo = "topicDetail";
    let sign = await AskSign("https://api.izuiyou.com/topic/detail_v2", params, echo);
    let result = await Http.call(sign.url, sign.params);
    result = JSON.parse(result);
    return result.data.list[0];

}


readLine("最右Topic.txt").go(async (data, next) => {
    await sleep(1)
    data = JSON.parse(data);
    data.firstContent = await topicDetail(data.id);
    File.appendFileSync("最.txt", JSON.stringify(data) + "\n");
    next();
})
