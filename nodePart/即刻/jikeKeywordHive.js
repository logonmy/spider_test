const http = require("https");
const Http = require("./api/http").Http;
const Queue = require("./api/queue").Queue;
const Task = require("./api/task").Task;
const Socket = require("./api/socket").Socket;

const getApi = require("./api/fetch").getApi;

const BEE_NAME = "jike_topic_keyword";
let token;
let out = false;
let cardCommentCount = 0;
let brick_id = 16661;

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

const filterItems = async (data) => {
    Socket.log(data);
    let query = {
        partition: "jike",
        keys: data.map((item) => {
            return item.id
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

let getKeyword = async(keyword, loadMoreKey) =>{
    console.log(keyword, loadMoreKey, "getKeywordINGGGGGGG");
    let moreArgs = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            "x-jike-app-auth-jwt": token
        },
        body: JSON.stringify({
            loadMoreKey: loadMoreKey,
			"keywords": keyword,
            "limit":99
        })
    }
    let result = await getApi("https://app.jike.ruguoapp.com/1.0/messages/search", moreArgs);

    let datas = result.data;

    for(let da of datas){
        let comment = await getCardComment(da.id);
        await sleep(0.5)
        da.addComment = comment;
    }

    return datas;}

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

//开始运行
(async () => {
    Socket.startHeartBeat("jike_topic_keyword");
    token = await getToken();
	while(true){
	    brick_id = await getBrickId();
        let task = await Task.fetchTask(BEE_NAME);
        if(task === null){
            console.log("暂时没有任务");
        	await sleep(5);
        	continue
		}
        console.log(task);
        cardCommentCount = 0;

        let config = JSON.parse(task.config);
        if (config.fromtopictree) {
            task.brick_id = brick_id;
        } else {
            task.brick_id = JSON.parse(task.config).brick_id;
        }

        let result = await getKeyword(task.value, null);
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

