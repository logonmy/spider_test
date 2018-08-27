const http = require("https");
const Http = require("../api/http").Http;
const Https = require("../api/https").Http;
const Task = require("../api/task").Task;
const Socket = require("../api/socket").Socket;
const Queue = require("../api/queue").Queue

const getApi = require("../api/fetch").getApi;

const BEE_NAME = "jike_topic_history";
let token;
let out = false;
let cardCommentCount = 0;

const getCookie = (() => {
    let users = [
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

const filterItems = async (data) => {
    Socket.log(data);
    let query = {
        partition: "jike",
        keys: data.map((item) => {
            return item.id + ""
        })
    };
    Socket.log(query);
    let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
    res = JSON.parse(res);
    Socket.log(res);
    data = data.filter((item, i) => (res.result.filter_result[i]));
    return data;
};
const postDataToDereplicate = async (data) => {
    let query = {
        partition: "jike",
        key: data
    };
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
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
const readLegoById = async(brick_id) => {
    let href = "http://chatbot.api.talkmoment.com/lego/library/legobrick/get?brick_id=" + brick_id+ "&version=002";
    let result = await Http.get(href);
    result = JSON.parse(result).result;
    return result.name;
}


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
    Socket.log("已经获取其中一条的评论",cardCommentCount++);
    Socket.log(result.content);
    if(!result){
        out = true;
    }
    return result;}
let getTopicContent = async (topicId, loadMoreKey) => {
    Socket.log(topicId, loadMoreKey, "getTopicContentINGGGGGGG");
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
let getAllTopicContent = async (topicId, loadMoreKey) => {
    let datas = []
    let result = await getTopicContent(topicId, loadMoreKey);
    datas = datas.concat(result.data);
    if(!result.data){
        result.data = []
    }
    while(result && result.data && result.data.length > 0){
        let ll = result.data.length;

        console.log(new Date(result.data[ll - 1].createdAt).getTime());
        if(result.loadMoreKey){
            console.log("永不下一页");
            break;
            Socket.log("下一页");
            await sleep(1);
            result = await getTopicContent(topicId, result.loadMoreKey);
            datas = datas.concat(result.data);
        }else{
            Socket.log("这页已经够了");
            break;
        }
    }


    if(datas && datas.length){
        Socket.log("共计拿到  ", datas.length, "条");
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
const getTopicId = async(value) => {

    console.log(value, "getTopicIdINGGGGGGG");
    let headers = {
        "x-jike-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiWTVVdHFMbGVCQTI5a2UwTjdScTFIcUVOQ2d2V1FJcDdySGNJV2hyQ0k4TnpJVXg3MU51TnRyaTd6UXl1ZzljMmVsMFZ2RzhqajFFZm9nODFOdUZXVVlveGZnTFZsTGpKU1B6UXNPMlV4eHJPVTdhd3ZkblJXS0NIOXpOVlltMDdLZ2ZHcXZIeVRLTkVsdW4zeDNkbHEwRndDNXVLeENkVytzb0pjbElaQ3plT1pYOGh4ZHQzaDZkeWpVcXc3VGs1TmRXTlRndUt4MDg3QlhERm5YbGNpbUh3dldOQ3lXK3I0QkxkN3ArQXZnV2VNQ0NxWTAwVTUyRUx5UkJHazFcLzFaQ1phOHdseHY0XC8zS1AzNzcrWXU1ZVVnMWFEOEN2ZmNjdU5mRXdrQ3VwWHVsMHdSbnErSlVISGZjOUtVSUhvbEhGWXVuNVArcVYzR29mXC9ZbkRRRG93PT0iLCJ2IjozLCJpdiI6IkowWGNwbEtjTlwvRlwvN1Bhd3hYS3hDdz09IiwiaWF0IjoxNTM1MzM3NDk4Ljc3N30.E6dQwG4hDTQChcsX99QNPaTaMces6UMAUCrLIVz555g",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
        "Accept": "application/json",
        "App-Version": "4.1.0",
        "Content-Type": "application/json",
        "Origin": "https://web.okjike.com",
        "platform": "web",
        "Referer": "https://web.okjike.com/feed"        
    }
    let href = "https://app.jike.ruguoapp.com/1.0/search/integrate?keyword=" + encodeURIComponent(value);
    let result = await Https.get(href,headers);    
    result = await Https.get(href,headers);    

    console.log(result);
    if(result && result.data && result.data[0]){
        return result.data[0].id;
    }
    return false;
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
    Socket.startHeartBeat("jike_topic_history");
    token = await getToken();
    let task = null;
    while(true){
        try{
            task = await Task.fetchTask(BEE_NAME);
        }catch(e){
            console.log(e);
            await sleep(5);
            continue
        }

        console.log(task);
        cardCommentCount = 0;
        task.brick_id = JSON.parse(task.config).brick_id;
        let topicId;
        if(task.value.length !== 24){
            topicId = await getTopicId(task.value);
            console.log("获得topicId", topicId)
            if(!topicId) {
                await Task.rejectTask(task)
                continue
            }
        }else{
            topicId = task.value;
        }

        let result = await getAllTopicContent(topicId, null);
        console.log(result.length);
        result = await filterItems(result);
        for(let re of result){
            re.keyword = task.value;
            re.brick_id = task.brick_id;
            // await postDataToDereplicate(re.id);
            // await postWashTask(task.brick_id, re)
        }
        let legoName = await readLegoById(task.brick_id);
        let update = {
            topic_id: topicId,
            brick_id: task.brick_id,
            name: legoName,
            created_at: new Date().getTime()
        }
        await Queue.postDataToMessage("jike_new_date", update);
        Socket.log("已经加入即刻更新队列 保持对该话题的更新");
        await sleep(5)
    }
})();

