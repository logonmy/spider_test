const http = require("https");
const Http = require("../api/http").Http;
const Https = require("../api/https").Http;
const Task = require("../api/task").Task;
const Socket = require("../api/socket").Socket;
const File = require("fs");
const RedisClient = require("../api/redis").RedisClient
const redis = new RedisClient({host: "127.0.0.1", port: 6379})

let getcommentCount = 0;
let trueBrickId = 16661;

const io = require("socket.io-client");
const socket = io("http://ws.api.talkmoment.com:51179");
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
}

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
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
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
const postDataToMessage = async (data) => {
    await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${BEE_NAME}`, data);
};

let getCommentOne = async (offset, id) => {
    let sign, result;
    try {
        sign = await AskSign("https://api.izuiyou.com/review/hot_reviews", {offset: offset, pid: id}, "getComment");
    } catch (e) {
        console.log("请求sign出错了");
        let tryOther = await getCommentOne(offset, id);
        console.log(e);
        return tryOther;
    }
    try {
        result = await Https.call(sign.url, sign.params);
        result = JSON.parse(result);
    } catch (e) {
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

let getCommentAll = async (id) => {
    let datas = [];
    const limit = 200;
    let result, offset;
    try {
        let sign = await AskSign("https://api.izuiyou.com/post/detail", {pid: id}, "getComment");
        result = await Https.call(sign.url, sign.params);
        offset = 15;
        result = JSON.parse(result);
        if (result && result.data && result.data.newreviews) {
            datas = datas.concat(result.data.newreviews);
        }
    } catch (e) {
        console.log("获取全部评论的第一步就坏事了");
        let back = await getCommentAll(id);
        return back;
    }


    while (datas && 9 < datas.length && result && result.data && result.data.newreviews.length < limit) {
        let comm = await getCommentOne(offset, id);
        datas = comm.data;
        offset = comm.offset;
        result.data.newreviews = result.data.newreviews.concat(datas);
    }

    Socket.log("成功获取评论", getcommentCount++);

    return result
}

const getTopicId = (value) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sign = await AskSign("https://api.izuiyou.com/search/topic", {q: value}, "getTopicId");
            let result = await Https.call(sign.url, sign.params);
            result = JSON.parse(result);
            let id = result.data.list[0].id;
            resolve(id);
        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
}

let getTopicOne = async (topicId, next_cb) => {
    Socket.log("翻到下一页了", next_cb);
    //await sleep(1);

    try {
        let sign = await AskSign("https://api.izuiyou.com/topic/posts_list", {
            tid: topicId,
            sort: "new",
            next_cb: next_cb
        }, "getTopic");
        let result = await Https.call(sign.url, sign.params);
        result = JSON.parse(result);
        return result
    } catch (e) {
        let tryOther = await getTopicOne(topicId, next_cb);
        console.log(e);
        return tryOther;
    }

}

let getTopicAll = async (topicId, ZeroTime) => {
    let datas = [];
    let sign;
    let result;
    let next_cb;
    return new Promise(async (resolve, reject) => {
        try {
            sign = await AskSign("https://api.izuiyou.com/topic/posts", {tid: topicId, t: 0,offset: 0}, "getTopic");
            result = await Https.call(sign.url, sign.params);
            result = JSON.parse(result);
            datas = datas.concat(result.data.list);
            next_cb = result.data.next_cb;
        } catch (e) {
            reject(new Date(), "getTopicAll的第一步就错了");
        }

        if (datas.length) {
            for (let da of datas) {
                if(da.created_at < ZeroTime) break;
                let comment = await getCommentAll(da.id);
                if (comment && comment.data && comment.data.hotreviews) {
                    da.hotreviews = comment.data.hotreviews;
                }
                if (comment && comment.data && comment.data.newreviews) {
                    da.newreviews = comment.data.newreviews;
                }
            }
        } else {
            reject("莫名其妙datas没有数据");
        }

        resolve(datas);
    })
}

const run = async (name, ZeroTime, brick_id) => {

    trueBrickId = await getBrickId();
    let id;
    let result;

    try{
        id = await getTopicId(name);
        console.log(name, id);
        // File.appendFileSync("result.txt", JSON.stringify({
        //     brick_id: brick_id,
        //     name: name,
        //     id: id
        // }) + "\n");
    }catch(e){
        // console.log(e);
        // File.appendFileSync("error.txt", name + "\n");
        // console.log("###############################################")
        return ;
    }
    try{
        result = await getTopicAll(id, ZeroTime);
    }catch(e){
        console.log(e)
        console.log("###############################################")
        return;
    }


    result = await filterItems(result);
    try {
        for (let re of result) {

            if(re.hotreviews.length + re.newreviews.length < 3){
                continue;
            }

            let test = await redis.sadd("zuiyou" + brick_id, re.id);
            if(test == 0){
                console.log("已经存在了 痕迹吧恐怖 明明filter过的");
                continue
            }else{

                console.log("上传" + re.topic.topic + "  的  " + re.content);
                await postDataToDereplicate(re.id);
                await postDataToMessage(re);
                let task_id = await postWashTask(trueBrickId, re);
                await Task.countTask(task_id, "zuiyou_update");
                await sleep(0.5);
            }
        }
    } catch (e) {
        console.log(e)
        console.log("上传数据的时候不要吊它");
    }
    await sleep(1);
    console.log("###############################################")
}

const getBrickId = async() => {
    let getTrueName = () => {
        var date = new Date();
        var yyyy = date.getFullYear();
        var mm = date.getMonth() + 1;
        if (mm < 10) {
            mm = "0" + mm.toString();
        }
        var dd = date.getDate();
        if (dd < 10) {
            dd = "0" + dd.toString();
        }
        var name = yyyy + mm + dd + "更新";
        return name;
    }

    let trueName = getTrueName();

    let data = await Http.get("http://chatbot.api.talkmoment.com/lego/library/brick/list?limit=20&version=002");
    data = JSON.parse(data);
    data = data.result;
    for(let da of data){
        if(da.name == trueName){
            return da.id;
        }
    }

    return false;
}

(async () => {

    let ZeroTime;
    let jump = [16608, 16579, 16601]

    while (true) {

        ZeroTime = new Date(new Date().setHours(0, 0, 0, 0));
        ZeroTime = ZeroTime.getTime();

        await redis.connect()
        let config = await redis.lpop("zuiyou_list");

        await redis.rpush("zuiyou_list", config);
        config = JSON.parse(config);
        if(parseInt(config.brick_id) in jump){
            console.log("跳过 球球大作战这智障东西");
            console.log(config.name);
            continue;
        }

        console.log("开始爬取内容", config.name, "   ", config.brick_id);
        await run(config.name, ZeroTime, config.brick_id);
    }
})();