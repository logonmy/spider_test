const Http = require("../api/http").Http;
const Https = require("../api/https").Http;
const Task = require("../api/task").Task;
const Socket = require("../api/socket").Socket;
const io = require("socket.io-client");
const getApi = require("../api/fetch").getApi;

let getcommentCount = 0;
let brick_id = 16661;
//let publish = false;
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
            reject("askSign的时候超时了 超过10秒");
        }, 10000)
        myEmitter.once(echo, (data) => {
            clearTimeout(timeout);
            resolve(data);
        })
    })
}

const BEE_NAME = "zuiyou_keyword";
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const filterItems = async (data) => {
    let query = {
        partition: "zuiyou",
        keys: data.map((item) => {
            return item.id + ""
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
        key: data
    };
    try{
        await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
    }catch(e){
        await postDataToDereplicate(data);
    }
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
    try{
        await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
    }catch(e){
       await postWashTask(brick_id, data);
    }
};
const postDataToMessage = async (data) => {
    try{
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${BEE_NAME}`, data);
    }catch(e){
        console.log(e);
        await postDataToDereplicate(data);
    }
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

let getKeyWordOne = async(offset,keyword) => {
    console.log(offset, keyword, "getKeywordINGGGGGGGGGGGGGGGGGG");
    let sign = await AskSign("https://api.izuiyou.com/search/post", {offset: offset,q: keyword}, "getKeyword");
    let result;
    try{
        result = await Https.call(sign.url, sign.params);
    }catch(e){
        return await getKeyWordOne(offset, keyword);
    }
    result = JSON.parse(result);
    await sleep(1)
    return {
        data: result.data.list,
        offset: result.data.offset,
    }
}

let getKeywordAll = async(keyword) =>{
    let datas = [];
    let sign = await AskSign("https://api.izuiyou.com/search/post", {offset: 0,q: keyword}, "getKeyword");
    let result;
    try{
        result = await Https.call(sign.url, sign.params);
        result = JSON.parse(result);
    }catch(e){
        return await getKeywordAll(keyword);
    }
    datas = datas.concat(result.data.list);
    let offset = result.data.offset;

    while (offset && offset < 120 && datas.length < 100){
        let result = await getKeyWordOne(offset, keyword);
        offset = result.offset;
        datas = datas.concat(result.data);
    }
    //todo 按照作者 标题去重

    for(let da of datas){
        let comment = await getCommentAll(da.id);
        da.hotreviews = comment.data.hotreviews;
        da.newreviews = comment.data.newreviews;
    }
    return datas;
}

(async () => {
    Socket.startHeartBeat(BEE_NAME);
    while(true){
        brick_id = await getBrickId();

        let task;
        try{
            task = await Task.fetchTask(BEE_NAME);
        }catch(e){
            console.log(e);
            await sleep(5)
            continue;
        }

        getcommentCount = 0

        if(task === null){
            Socket.log("暂时没有任务");
            await sleep(5);
            continue
        }
        console.log(task);

        let config = JSON.parse(task.config);
        if (config.fromtopictree) {
            task.brick_id = brick_id;
        } else {
            task.brick_id = JSON.parse(task.config).brick_id;
        }

        let result = await getKeywordAll(task.value);
        if(!result){
            task.reject();
        }
        console.log(result.length);
        result = await filterItems(result);
        for(let re of result){
            re.keyword = task.value;
            re.brick_id = task.brick_id;
            await postDataToDereplicate(re.id);
            await postDataToMessage(re);
            await postWashTask(task.brick_id, re)
        }
        await sleep(5)
    }
})();