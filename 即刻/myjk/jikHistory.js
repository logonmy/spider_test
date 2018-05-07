const http = require("https");
const Http = require("./api/http").Http;
const Queue = require("./api/queue").Queue;

const getApi = require("./api/fetch").getApi;


//between created_at === splitDate

//检测是否已经跑过

const splitDate = 1525276800000;

const BEE_NAME = "jike_topic_history"
let token;
let out = false;

const getCookie = (() => {
    let users = [
        "jike:sess=eyJfdWlkIjoiNWFkZWM4ZjM4MGU2MDAwMDE3ZTJlOGJiIiwiX3Nlc3Npb25Ub2tlbiI6Ing4c2I1U0pZeWcwQnczem5sZmVZOEE3cGcifQ==; path=/; expires=Fri, 19 Apr 2019 06:58:18 GMT; domain=.jike.ruguoapp.com; secure; httponly;jike:sess.sig=qAdw4DJw6MmBS2qRupCRNAHL0bM; path=/; expires=Fri, 19 Apr 2019 06:58:18 GMT; domain=.jike.ruguoapp.com; secure; httponly",
        "jike:sess=eyJfdWlkIjoiNWFkZWQ1ZWRkZjBjNjUwMDE3MzQxYTQzIiwiX3Nlc3Npb25Ub2tlbiI6Ik5QWnJ4N2tGWnE2TkNFdjl4RUJtc0JCTUQifQ==; path=/; expires=Fri, 19 Apr 2019 07:09:01 GMT; domain=.jike.ruguoapp.com; secure; httponly;jike:sess.sig=xO4EuDEaXjq6S7bJP7_6w8t1L8Y; path=/; expires=Fri, 19 Apr 2019 07:09:01 GMT; domain=.jike.ruguoapp.com; secure; httponly",
        "jike:sess=eyJfdWlkIjoiNWFkZWQ5NzkwNjUxOTgwMDE3NTJlMzBiIiwiX3Nlc3Npb25Ub2tlbiI6InlxZEdyVWRTa01kTTRsRlZLTGhuZ0JQR1oifQ==; path=/; expires=Fri, 19 Apr 2019 07:16:48 GMT; domain=.jike.ruguoapp.com; secure; httponly;jike:sess.sig=CBNFqijfvdKHWh3VXrVdcXnOrUM; path=/; expires=Fri, 19 Apr 2019 07:16:48 GMT; domain=.jike.ruguoapp.com; secure; httponly",
        "jike:sess=eyJfdWlkIjoiNWFkZWRhMjQ3NjQwZDUwMDE3ZGIwN2Y2IiwiX3Nlc3Npb25Ub2tlbiI6InJaNVUzVjZJQTJOa21rVmtJbUUzOEIxTXUifQ==; path=/; expires=Fri, 19 Apr 2019 07:20:32 GMT; domain=.jike.ruguoapp.com; secure; httponly;jike:sess.sig=4ABn6K2Uoxs_GzNCEpVcwjwPiuw; path=/; expires=Fri, 19 Apr 2019 07:20:32 GMT; domain=.jike.ruguoapp.com; secure; httponly",
        "jike:sess=eyJfdWlkIjoiNWFkZWRiMjhiYTg3YjAwMDE3NzdhMmU0IiwiX3Nlc3Npb25Ub2tlbiI6IlRZYkhMVFUyMEJPNVZXaVE1ZjE2SzIzbjMifQ==; path=/; expires=Fri, 19 Apr 2019 07:24:35 GMT; domain=.jike.ruguoapp.com; secure; httponly;jike:sess.sig=xjpaeEL_XqneHGRERK8n4xkyEQk; path=/; expires=Fri, 19 Apr 2019 07:24:35 GMT; domain=.jike.ruguoapp.com; secure; httponly",
    ];
    return () => {
        let result = users.shift();
        users.push(result);
        return result;
    }
})();

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const httpGet = async (path, header) => {
    let timeout = 10000;
    if(!header){
        header = {
            "Content-Type":"application/json",
            "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        }
    }
    let options = {
        protocol: path.split(":")[0] + ":",
        hostname: path.split("//")[1].split("/")[0],
        method: "GET",
        path: "/" + path.split("com/")[1],
        headers: header
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, (res) => {
            let data = "";
            res.setEncoding('utf-8');
            res.on("data", (chunk) => {
                data += chunk;
            })
            res.on("end", () => {
                resolve(data);
            })
        })

        req.setTimeout(timeout, () => {
            //reject("timeout")
            process.exit()
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })
        req.end();
    })
}
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
const getUuid = async() => {
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.create");
    return JSON.parse(result).uuid;}
const login = async(uuid, cookie) => {
    let headers = {
        "Host":"app.jike.ruguoapp.com",
        "Content-Type":"application/json",
        "Origin":"https://ruguoapp.com",
        "Connection":"keep-alive",
        "Accept":"*/*",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer":"https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language":"zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.login?uuid=" + uuid, headers);
    return result;}
const confirm = async(uuid, cookie) => {
    let headers = {
        "Host":"app.jike.ruguoapp.com",
        "Content-Type":"application/json",
        "Origin":"https://ruguoapp.com",
        "Connection":"keep-alive",
        "Accept":"*/*",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer":"https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language":"zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.confirm?uuid=" + uuid, headers);
    return result;}
const confirmation = async(uuid, cookie) => {
    let headers = {
        "Host":"app.jike.ruguoapp.com",
        "Content-Type":"application/json",
        "Origin":"https://ruguoapp.com",
        "Connection":"keep-alive",
        "Accept":"*/*",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer":"https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language":"zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.wait_for_confirmation?uuid=" + uuid, headers);
    return result;}
let getToken = async () => {
    let cookie = getCookie()
    let uuid = await getUuid();
    await sleep(1);
    if(JSON.parse(await login(uuid, cookie)).success){
        await sleep(1)
        if(JSON.parse(await confirm(uuid, cookie)).success){
            await sleep(1)
            if(JSON.parse(await confirmation(uuid, cookie)).token){
                console.log("token获取成功");
                return JSON.parse(await confirmation(uuid, cookie)).token
            }else{
                throw Error("confirmation 出错");
            }
        }else{
            throw Error("confirm 出错")
        }
    }else{
        throw Error("login 出错")
    }}

let getTopicId = async() =>{

}

let getTopicContent = async (topicId, loadMoreKey) => {
    console.log(topicId, loadMoreKey, "getTopicContentINGGGGGGG");
    let moreArgs = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            "x-jike-app-auth-jwt": token
        },
        body: JSON.stringify({
            "loadMoreKey":loadMoreKey,
            "topic":topicId,
            "limit":50
        })
    }
    let result = await getApi("https://app.jike.ruguoapp.com/1.0/messages/history", moreArgs);
    return result;}

let getCardComment = async (targetId)=> {
    console.log(targetId, "getCardCommentINGGGGG");
    let moreArgs = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            "x-jike-app-auth-jwt": token
        },
        body: JSON.stringify({
            "targetId": targetId,
            "limit":20,
            "targetType": "OFFICIAL_MESSAGE"
        })
    }
    let result = await getApi("https://app.jike.ruguoapp.com/1.0/comments/listPrimary", moreArgs);
    if(!result){
        out = true;
    }
    return result;}

let getAllTopicContent = async (topicId, loadMoreKey, created_at) => {
    if(created_at === 0 && !created_at){
        return ;
    }
    let datas = []
    let result = await getTopicContent(topicId, loadMoreKey, created_at);
    if(!result.data){
        result.data = []
    }
    while(result && result.data && result.data.length > 0){

        for(let data of result.data){
            if(new Date(data.createdAt).getTime() > created_at && new Date(data.createdAt).getTime() < splitDate){
                datas.push(data);
            }
        }
        let ll = result.data.length;

        console.log(new Date(result.data[ll - 1].createdAt).getTime());
        console.log(created_at)
        if(result.loadMoreKey && new Date(result.data[ll - 1].createdAt).getTime() > created_at){
            console.log("下一页");
            await sleep(1);
            result = await getTopicContent(topicId, result.loadMoreKey);
        }else{
            console.log("这页已经够了");
            break;
        }
    }


    if(datas && datas.length){
        console.log("共计拿到  ", datas.length, "条");
    }

    for(let da of datas){
        if(da.createdAt){
            try{
                da.created_at = new Date(da.createdAt).getTime();
                delete da.createdAt;
            }catch(e){
                console.log(e)
            }
        }
        let comment = await getCardComment(da.id);
        await sleep(0.5)
        da.addComment = comment;
    }

    return datas;}


let run = async (name, topicId, brick_id, created_at) => {
    console.log("开始run");
    if(created_at > splitDate){
        console.log("run中 created_at > splitDate");
        return ;
    }
    let result = await getAllTopicContent(topicId, null, created_at);

    if(result){
        for(let data of result){
            console.log("上传" + data.title + "  的  "  + data.content);
            await postDataToMessage(data);
            console.log("brick_iiiiiiiiid", brick_id);
            await postWashTask(brick_id, data);
            await sleep(0.5);
        }
    }
    console.log("###########################")

}

//更新token
(async ()=> {
    while(true){
        if(out){
            break;
        }
        await sleep(300);
        token = await getToken();
    }

})();

//开始运行
(async () => {
    token = await getToken();

    while(true){
        let config =await Queue.getDataFromMessage("jike_old_date");
        config = JSON.parse(config.result);
        console.log(config)
        if(config.created_at > splitDate) {
            console.log("config处 created_at 大于 splitDate");
            continue;}
        await run(config.name, config.topic_id, config.brick_id, config.created_at);
    }

})();