const http = require("https");
const File = require("fs");
const readLine = require("lei-stream").readLine;
const Queue = require("./api/queue").Queue;
const Http = require("./api/http").Http;

const getApi = require("./api/fetch").getApi;
const getPage = require("./api/fetch").getPage;

const queueName = "jikeAllNeeded"
const BEE_NAME = "jike_topic_history"
let token;
let out = false;
let topicResult = [];

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
    await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
};
let postOneCount = 0
const postDataToMessage = async (data) => {
    console.log("postone" + postOneCount);
    await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${BEE_NAME}`, data);
    postOneCount++;
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

let getTopicContent = async (topicId, loadMoreKey) => {
    console.log(topicId, loadMoreKey);
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
    console.log(targetId);
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

let getAllTopicContent = async (topicId, loadMoreKey) => {
    let datas = []
    let result = await getTopicContent(topicId, loadMoreKey);

    while(result.data.length > 0){
        for(let data of result.data){
            datas.push(data);
        }
        if(result.loadMoreKey){
            await sleep(1);
            result = await getTopicContent(topicId, result.loadMoreKey);    
        }else{
            break;
        }
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


let run = async (topicId, brick_id) => {
    
    let result = await getAllTopicContent(topicId, null);
    topicResult.push({
        data: result,
        brick_id: brick_id
    });

}

(async ()=> {
    while(true){
        if(out){
            break;
        }
        await sleep(300);
        token = await getToken();
    }
    
})();

(async ()=> {
    let postCount;
    while(true){
        postCount = 0
        if(topicResult.length > 0){
            let result = topicResult.shift();
            for(let data of result.data){
                console.log("postone", postCount);
                postCount++;
                postDataToMessage(data);
                postWashTask(result.brick_id, data);
                await sleep(0.5);
            }
        }
        await sleep(50);
    }
})();

(async () => {
    let count = 1;
    token = await getToken();

    while(true){
        let naturalData = JSON.parse((await Queue.getDataFromMessage(queueName)).result);
        naturalData = JSON.parse(naturalData);
        console.log("开始爬取第" + count + "个话题 " + naturalData.topic_name);
        await run(naturalData.topic_id, naturalData.brick_id);
        console.log("第" + count + "个话题爬取完毕");
        //推进消息队列
        count++   
    }
})();
