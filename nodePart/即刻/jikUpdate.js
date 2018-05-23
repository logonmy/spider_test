const http = require("https");
const Http = require("../api/http").Http;
const Queue = require("../api/queue").Queue;
const shuffle = require('knuth-shuffle').knuthShuffle
const getApi = require("../api/fetch").getApi;
const RedisClient = require("../api/redis").RedisClient
const redis = new RedisClient({host: "127.0.0.1", port: 6379})
//const splitDate = 1525276800000;
//const splitDate = 1526500000000;

const BEE_NAME = "jike_topic_update"
let token;
let out = false;
let update = true;
let cookieING;
let trueBrickId;


const postDataToDereplicate = async (data) => {
    let query = {
        partition: "jike",
        key: data
    };
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
};

function FormatDate(strTime) {
    var date = new Date(strTime);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}

const getCookie = (() => {
    let users = [
        "jike:sess=eyJfdWlkIjoiNWFmOTQwMjQ3MjUxMGMwMDExYzU1YmE0IiwiX3Nlc3Npb25Ub2tlbiI6ImVkRlZTN3R4NWJSenFvdlJueUJ1VzJYSnAifQ==; path=/; expires=Sun, 12 May 2019 07:08:10 GMT; domain=.jike.ruguoapp.com; httponly;jike:sess.sig=gBnMYkol3x-sBae8qjtqP26KoVc; path=/; expires=Sun, 12 May 2019 07:08:10 GMT; domain=.jike.ruguoapp.com; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmOTNmN2UxMWY4YWIwMDE3MGU0YmNjIiwiX3Nlc3Npb25Ub2tlbiI6IjM2VnRKTWFrclZaZ2JISXUyV3NITXRsUk8ifQ==; path=/; expires=Sun, 12 May 2019 06:37:51 GMT; domain=.jike.ruguoapp.com; secure; httponly;jike:sess.sig=gG8RqVgPuThXUtruOXAfr6JLbBA; path=/; expires=Sun, 12 May 2019 06:37:51 GMT; domain=.jike.ruguoapp.com; secure; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmOTQwZDFjODgxMjcwMDE3ZDUxMTMzIiwiX3Nlc3Npb25Ub2tlbiI6IlFTM2M4NmZKNnUzQWRGQTZ1OU5NeVhyMXMifQ==; path=/; expires=Sun, 12 May 2019 06:41:32 GMT; domain=.jike.ruguoapp.com; httponly; jike:sess.sig=KwiH0ax-JviEfDkvYhtnO44F8o4; path=/; expires=Sun, 12 May 2019 06:41:32 GMT; domain=.jike.ruguoapp.com; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmOTNiZDk5Y2ZlY2QwMDE3YWE0MWUyIiwiX3Nlc3Npb25Ub2tlbiI6ImFRZGhyb05TemNqbGdTeFNRbUY2NE1lcWYifQ==; path=/; expires=Sun, 12 May 2019 07:01:45 GMT; domain=.jike.ruguoapp.com; secure; httponly;jike:sess.sig=J3i3ubDMM8p_PCimXg87iUObykk; path=/; expires=Sun, 12 May 2019 07:01:45 GMT; domain=.jike.ruguoapp.com; secure; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmOTNlNzIxMWY4YWIwMDE3MGU0YmFlIiwiX3Nlc3Npb25Ub2tlbiI6IlQxNEIxdU5QS05kN1VhZ0pmcnRrYkhVSWUifQ==; path=/; expires=Sun, 12 May 2019 07:04:02 GMT; domain=.jike.ruguoapp.com; httponly;jike:sess.sig=o7qDkJD8AJJHs8ZL0OhnAa4HQaQ; path=/; expires=Sun, 12 May 2019 07:04:02 GMT; domain=.jike.ruguoapp.com; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmZDI5ZTQ3ZmEwMTAwMDE3ZTlmNDBkIiwiX3Nlc3Npb25Ub2tlbiI6IkFPbHBJRUhBV3NaMXVBQWFLUmU3WTR1WGsifQ==; path=/; expires=Sun, 12 May 2019 07:06:47 GMT; domain=.jike.ruguoapp.com; httponly;jike:sess.sig=CAXaBKKz8n0LJmgILt8c75cLeeY; path=/; expires=Sun, 12 May 2019 07:06:47 GMT; domain=.jike.ruguoapp.com; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmZDJhYmM2ODRmYzMwMDE3OWE3NGZjIiwiX3Nlc3Npb25Ub2tlbiI6IjBhZ0ZFVFpzVTg4Sm0xZWwzNndadXFjVncifQ==; path=/; expires=Sun, 12 May 2019 07:10:35 GMT; domain=.jike.ruguoapp.com; httponly;jike:sess.sig=BpnMj7wOobQ281BDi_A2CCqAlnY; path=/; expires=Sun, 12 May 2019 07:10:35 GMT; domain=.jike.ruguoapp.com; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmZDJiMWE2ODRmYzMwMDE3OWE3NTEwIiwiX3Nlc3Npb25Ub2tlbiI6Iko0eVZHMGgxVXVlN2FRZVpkbEJ4anpiS1YifQ==; path=/; expires=Sun, 12 May 2019 07:11:56 GMT; domain=.jike.ruguoapp.com; httponly;jike:sess.sig=o4SgRveIjkqu1-lx6omWFx_8GwA; path=/; expires=Sun, 12 May 2019 07:11:56 GMT; domain=.jike.ruguoapp.com; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmZDJiMWE2ODRmYzMwMDE3OWE3NTEwIiwiX3Nlc3Npb25Ub2tlbiI6Iko0eVZHMGgxVXVlN2FRZVpkbEJ4anpiS1YifQ==; path=/; expires=Sun, 12 May 2019 07:14:38 GMT; domain=.jike.ruguoapp.com; httponly;jike:sess.sig=o4SgRveIjkqu1-lx6omWFx_8GwA; path=/; expires=Sun, 12 May 2019 07:14:38 GMT; domain=.jike.ruguoapp.com; httponly",
        "jike:sess=eyJfdWlkIjoiNWFmZDJjMGJlMzlhNzcwMDFjOTdiMDI1IiwiX3Nlc3Npb25Ub2tlbiI6IjBtMmRQdGtFSXBhd2ZteWl1aGNHZEVHcnkifQ==; path=/; expires=Sun, 12 May 2019 07:15:57 GMT; domain=.jike.ruguoapp.com; httponly;jike:sess.sig=Q9rGRmJFzvSpOmtuyHHXXH5OzCs; path=/; expires=Sun, 12 May 2019 07:15:57 GMT; domain=.jike.ruguoapp.com; httponly"
    ];
    users = shuffle(users.slice(0))
    return () => {
        let result = users.shift();
        cookieING = result;
        users.push(result);
        return result;
    }
})();

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const httpGet = async (path, header) => {
    let timeout = 10000;
    if (!header) {
        header = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
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

        req.setTimeout(timeout, async () => {
            console.log("timeout");
            console.log("回传完毕");
            update = false;
            process.exit()
        })

        req.on("error", async (e) => {
            console.log(e);
            console.log("回传完毕");
            update = false;
            process.exit();
        })
        req.end();
    })
}
const postWashTask = async (brick_id, data) => {
    let washTask = {
        name: "wash_corpus",
        value: "",
        config: JSON.stringify({
            bee_source: BEE_NAME,
            brick_id: trueBrickId,
            publish: true,
            update: true
        }),
        data: JSON.stringify(data),
        scheduled_at: Date.now()
    };
    console.log("任务队列ing")
    console.log(brick_id);
    try {
        await Http.call("http://bee.api.talkmoment.com/scheduler/task/post", washTask);
    } catch (e) {
        await postWashTask(brick_id, data);
    }
};

const postDataToMessage = async (data) => {
    await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${BEE_NAME}`, data);
};
const getUuid = async () => {
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.create");
    return JSON.parse(result).uuid;
}
const login = async (uuid, cookie) => {
    let headers = {
        "Host": "app.jike.ruguoapp.com",
        "Content-Type": "application/json",
        "Origin": "https://ruguoapp.com",
        "Connection": "keep-alive",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer": "https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language": "zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.login?uuid=" + uuid, headers);
    return result;
}
const confirm = async (uuid, cookie) => {
    let headers = {
        "Host": "app.jike.ruguoapp.com",
        "Content-Type": "application/json",
        "Origin": "https://ruguoapp.com",
        "Connection": "keep-alive",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer": "https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language": "zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.confirm?uuid=" + uuid, headers);
    return result;
}
const confirmation = async (uuid, cookie) => {
    let headers = {
        "Host": "app.jike.ruguoapp.com",
        "Content-Type": "application/json",
        "Origin": "https://ruguoapp.com",
        "Connection": "keep-alive",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer": "https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language": "zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.wait_for_confirmation?uuid=" + uuid, headers);
    return result;
}
let getToken = async () => {
    console.log("开始获取token");
    let cookie = getCookie()
    let uuid = await getUuid();
    await sleep(1);
    if (JSON.parse(await login(uuid, cookie)).success) {
        await sleep(1)
        if (JSON.parse(await confirm(uuid, cookie)).success) {
            await sleep(1)
            if (JSON.parse(await confirmation(uuid, cookie)).token) {
                console.log("token获取成功");
                return JSON.parse(await confirmation(uuid, cookie)).token
            } else {
                throw Error("confirmation 出错");
            }
        } else {
            throw Error("confirm 出错")
        }
    } else {
        throw Error("login 出错")
    }
}

let getTopicContent = async (topicId, loadMoreKey) => {
    console.log(topicId, loadMoreKey, "getTopicContentINGGGGGGG");
    let moreArgs = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-jike-app-auth-jwt": token
        },
        body: JSON.stringify({
            "loadMoreKey": loadMoreKey,
            "topic": topicId,
            "limit": 50
        })
    }
    let result = await getApi("https://app.jike.ruguoapp.com/1.0/messages/history", moreArgs);
    return result;
}

let getCardComment = async (targetId) => {
    console.log(targetId, "getCardCommentINGGGGG");
    let moreArgs = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-jike-app-auth-jwt": token
        },
        body: JSON.stringify({
            "targetId": targetId,
            "limit": 20,
            "targetType": "OFFICIAL_MESSAGE"
        })
    }
    let result = await getApi("https://app.jike.ruguoapp.com/1.0/comments/listPrimary", moreArgs);
    if (!result) {
        out = true;
    }
    return result;
}

let getAllTopicContent = async (topicId, loadMoreKey, created_at) => {
    if (created_at === 0 && !created_at) {
        return;
    }
    let datas = []
    let result = await getTopicContent(topicId, loadMoreKey, created_at);
    if (!result.data) {
        result.data = []
    }
    while (result && result.data && result.data.length > 0) {
        for (let data of result.data) {
            if (new Date(data.createdAt).getTime() > created_at) {
                datas.push(data);
            }

        }
        let ll = result.data.length;
        console.log(new Date(result.data[0].createdAt).getTime())
        console.log(created_at);

        if (result.loadMoreKey && new Date(result.data[ll - 1].createdAt).getTime() > created_at) {
            console.log("下一页");
            await sleep(1);
            result = await getTopicContent(topicId, result.loadMoreKey);
        } else {
            console.log("这页已经够了");
            break;
        }
    }

    if (datas && datas.length) {
        console.log("共计拿到  ", datas.length, "条");
    }

    for (let da of datas) {
        if (da.createdAt) {
            try {
                da.created_at = new Date(da.createdAt).getTime();
                delete da.createdAt;
            } catch (e) {
                console.log(e)
            }
        }
        let comment = await getCardComment(da.id);
        await sleep(0.5)
        da.addComment = comment;
    }

    return datas;
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

let run = async (name, topicId, brick_id, created_at) => {
    let result = await getAllTopicContent(topicId, null, created_at);
    if (result) {
        for (let data of result) {

            console.log("开始检测是否已经爬取");
            let test = await redis.sadd("jike_" + brick_id, data.messageId);
            if (test == 0) {
                console.log("已经存在了")
                continue
            } else {
                console.log("上传" + data.title + "  的  " + data.content);
                await postDataToDereplicate(data.id);
                await postDataToMessage(data);
                await postWashTask(brick_id, data);
                await sleep(0.5);
            }
        }
        console.log("现在使用的cookie", cookieING);
        await sleep(2)
        console.log("###############################################")
    }

}

//更新token 和 brick_id
(async () => {
    while (update) {

        let brick_id =await getBrickId();
        if(brick_id){
            trueBrickId = brick_id;
        }

        if (out) {
            break;
        }
        await sleep(300);
        token = await getToken();
    }

})();

(async () => {
    token = await getToken();

    let ZeroTime;


    while (true) {

        ZeroTime = new Date(new Date().setHours(0, 0, 0, 0));
        ZeroTime = ZeroTime.getTime();

        await redis.connect()
        let config = await redis.lpop("jike_list");

        await redis.rpush("jike_list", config);
        config = JSON.parse(config);

        console.log("开始爬取内容", config.name, "   ", config.brick_id);

        config.name = config.name.substr(3);
        await run(config.name, config.topic_id, config.brick_id, ZeroTime);

        await redis.end();
    }

})();