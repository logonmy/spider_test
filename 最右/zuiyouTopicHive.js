const http = require("https");
const Http = require("./api/http").Http;
const Https = require("./api/https").Http;
const Task = require("./api/task").Task;
const Socket = require("./api/socket").Socket;
const File = require("fs")

let getcommentCount = 0;

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
            reject("timeout, 超出十秒了")
        }, 10000)
        myEmitter.once(echo, (data) => {
            clearTimeout(timeout);
            resolve(data);
        })
    })
}

const BEE_NAME = "zuiyou_history";
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const filterItems = async (data) => {
    let query = {
        partition: "zuiyou",
        keys: data.map((item) => {
            return "zuiyou" + item.id
        })
    };
    for(let q of query.keys){
        console.log(q, "q")
    }
    let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
    res = JSON.parse(res);
    Socket.log(res);
    data = data.filter((item, i) => (res.result.filter_result[i]));
    return data;
};
const postDataToDereplicate = async (data) => {
    let query = {
        partition: "zuiyou",
        key: "zuiyou" + data
    };
    console.log(query.key, "p");
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
};

const postWashTask = async(brick_id, data) => {
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
    console.log("任务队列ing")
    console.log(brick_id);
    await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
};
const postDataToMessage = async (data) => {
    await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${BEE_NAME}`, data);
};

let getCommentOne = async(offset, id) => {
    let sign = await AskSign("https://api.izuiyou.com/review/hot_reviews", {offset: offset, pid: id}, "getComment");
    let result = await Https.call(sign.url, sign.params);
    result = JSON.parse(result);
    console.log("增长了一次评论");
    await sleep(0.5);
    return {
        offset: result.data.offset,
        data: result.data.list
    }
}

let getCommentAll = async(id) => {
    let datas = [];
    const limit = 200;
    let sign = await AskSign("https://api.izuiyou.com/post/detail", {pid: id}, "getComment");
    let result = await Https.call(sign.url, sign.params);
    let offset = 15;
    result = JSON.parse(result);

    if(result && result.data && result.data.newreviews){
        datas = datas.concat(result.data.newreviews);
    }

    while(9 < datas.length && result && result.data && result.data.newreviews.length < limit){
        let comm = await getCommentOne(offset, id);
        datas = comm.data;
        console.log(datas.length, 1)
        offset = comm.offset;
        result.data.newreviews = result.data.newreviews.concat(datas);
    }

    Socket.log("成功获取评论", getcommentCount++);

    return result
}

let getTopicId = async(value) => {
    let sign = await AskSign("https://api.izuiyou.com/search/topic", {q: value}, "getTopicId");
    let result = await Https.call(sign.url, sign.params);
    console.log(result)
    result = JSON.parse(result);
    try{
        return result.data.list[0].id;
    }catch(e){
        return false;
    }

}

let getTopicOne = async (topicId, next_cb) => {
    Socket.log("翻到下一页了");
    await sleep(1);
    let sign = await AskSign("https://api.izuiyou.com/topic/posts_list", {tid: topicId, sort: "new", next_cb: next_cb}, "getTopic");
    let result = await Https.call(sign.url, sign.params);
    result = JSON.parse(result);
    return result
}

let getTopicAll = async (topicId) => {
    let datas = [];
    let sign = await AskSign("https://api.izuiyou.com/topic/posts_list", {tid: topicId, sort: "new"}, "getTopic");
    console.log(sign);
    let result = await Https.call(sign.url, sign.params);
    result = JSON.parse(result);
    datas = datas.concat(result.data.list);
    let next_cb = result.data.next_cb;
    console.log(result.data.more);

    while(result.data.more){
        result = await getTopicOne(topicId, next_cb);
        console.log(result.data.more, "more");
        console.log(result.data.list.length, "length");
        datas = datas.concat(result.data.list);
        next_cb = result.data.next_cb;
    }

    for(let da of datas){
        let comment = await getCommentAll(da.id);
        if(comment && comment.data && comment.data.hotreviews){
            da.hotreviews = comment.data.hotreviews;
        }
        if(comment && comment.data && comment.data.newreviews){
            da.newreviews = comment.data.newreviews;
        }
    }

    return datas;
}

(async () => {
    Socket.startHeartBeat(BEE_NAME);
    while(true){
        let task = await Task.fetchTask(BEE_NAME);
        getcommentCount = 0

        if(task === null){
            Socket.log("暂时没有任务");
            await sleep(5);
            continue
        }
        console.log(task);
        task.brick_id = JSON.parse(task.config).brick_id;

        let id = await getTopicId(task.value);
        if(!id){
            await task.rejectTask(task, "反正是失败了");
        }

        let result = await getTopicAll(id);
        if(!result){
            await task.rejectTask(task, "反正是失败了");
        }
        console.log(result.length);
        result = await filterItems(result);
        for(let re of result){
            re.brick_id = task.brick_id;
            await postDataToDereplicate(re.id);console.log(re.id);
            await postDataToMessage(re);
            await postWashTask(task.brick_id, re)
        }
        await sleep(5)
    }
})();