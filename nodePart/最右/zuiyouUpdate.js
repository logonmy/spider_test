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

const BEE_NAME = "zuiyou_update";
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
    let sign;
    try{
        sign = await AskSign("https://api.izuiyou.com/review/hot_reviews", {offset: offset, pid: id}, "getComment");
    }catch(e){
        console.log("请求sign出错了");
        let tryOther = await getCommentOne(offset, id);
        console.log(e);
        return tryOther;
    }

    let result = await Https.call(sign.url, sign.params);
    try{
        result = JSON.parse(result);
    }catch(e){
        console.log("获取评论失败了")
        console.log(e)
        console.log(result)
        return {
            offset: offset + 10,
            data: []
        }
    }

    console.log("增长了一次评论");
    //await sleep(0.5);
    return {
        offset: result.data.offset,
        data: result.data.list
    }
}

let getCommentAll = async(id) => {
    let datas = [];
    const limit = 200;
    let result, offset;
    try{
        let sign = await AskSign("https://api.izuiyou.com/post/detail", {pid: id}, "getComment");
        result = await Https.call(sign.url, sign.params);
        offset = 15;
        result = JSON.parse(result);
        if(result && result.data && result.data.newreviews){
            datas = datas.concat(result.data.newreviews);
        }
    }catch(e){
        console.log("获取全部评论的第一步就坏事了");
        let back = await getCommentAll(id);
        return back;
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

const getTopicId = (value) => {
    return new Promise(async (resolve, reject) => {
        try{
            let sign = await AskSign("https://api.izuiyou.com/search/topic", {q: value}, "getTopicId");
            let result = await Https.call(sign.url, sign.params);
            result = JSON.parse(result);
            resolve(result.data.list[0].id);
        }catch(e){
            console.log(e);
            reject(e);
        }
    })
}

let getTopicOne = async (topicId, next_cb) => {
    Socket.log("翻到下一页了",next_cb);
    //await sleep(1);

    try{
        let sign = await AskSign("https://api.izuiyou.com/topic/posts_list", {tid: topicId, sort: "new", next_cb: next_cb}, "getTopic");
        let result = await Https.call(sign.url, sign.params);
        result = JSON.parse(result);
        return result
    }catch(e){
        let tryOther = await getTopicOne(topicId, next_cb);
        console.log(e);
        return tryOther;
    }

}

let getTopicAll = async (topicId) => {
    let datas = [];
    let nextPageCount = 0;
    let sign;
    let result;
    let next_cb;
    return new Promise(async (resolve, reject) => {
        try{
            sign = await AskSign("https://api.izuiyou.com/topic/posts_list", {tid: topicId, sort: "new"}, "getTopic");
            result = await Https.call(sign.url, sign.params);
            result = JSON.parse(result);
            datas = datas.concat(result.data.list);
            next_cb = result.data.next_cb;
        }catch(e){
            reject(new Date(), "getTopicAll的第一步就错了");
        }

        while(result.data.more){
            Socket.log("现在是第 ", nextPageCount++ , " 个下一页")
            result = await getTopicOne(topicId, next_cb);
            datas = datas.concat(result.data.list);
            next_cb = result.data.next_cb;
        }

        if(datas.length){
            for(let da of datas){
                let comment = await getCommentAll(da.id);
                if(comment && comment.data && comment.data.hotreviews){
                    da.hotreviews = comment.data.hotreviews;
                }
                if(comment && comment.data && comment.data.newreviews){
                    da.newreviews = comment.data.newreviews;
                }
            }
        }else{
            reject("莫名其妙datas没有数据");
        }

        resolve(datas);
    })
}

(async () => {
    while(true){
        let task;
        try{
            task = await Task.fetchTask(BEE_NAME);
        }catch(e){
            console.log(e);
            await sleep(5);
            continue
        }
        getcommentCount = 0;
        console.log("获得任务", task);
        task.brick_id = JSON.parse(task.config).brick_id;

        let id, result;
        try{
            id = await getTopicId(task.value);
            result = await getTopicAll(id);

            console.log(result.length);
            result = await filterItems(result);
            try{
                for(let re of result){
                    re.brick_id = task.brick_id;
                    await postDataToDereplicate(re.id);console.log(re.id);
                    await postDataToMessage(re);
                    await postWaqshTask(task.brick_id, re)
                }
            }catch(e){
                console.log(e)
                console.log("上传数据的时候不要吊它");
            }
            await sleep(5)
        }catch(e) {
            console.log(e)
            await task.rejectTask(task, "反正是失败了");
            await sleep(5);
            continue;
        }
    }
})();