const fetch = require("node-fetch");
const http = require("http");
const https = require("https");

const timeout = 10000;
const safeFetch = async (url, moreArgs = {}) => {
    try {
        return await fetch(url, moreArgs);
    } catch (e) {
        console.error(e);
    }
};
const getApi = async (url, moreArgs = {headers: {"Content-Type":"application/json"}}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.json();
    } else {
        return false;
    }
};
const getXml = async (url, moreArgs = {headers: {"Content-Type":"application/json"}}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.text();
    } else {
        return false;
    }
};
const getPage = async (url, moreArgs = {}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.text();
    } else {
        return false;
    }
};

let Http = {};
let Https = {};
Http.post = async (path, args) => {
    let data = args || {};
    let postData = JSON.stringify(data);
    let options = {
        protocol: path.split(":")[0] + ":",
        host: path.split("//")[1].split("/")[0],
        //port: "3000",
        method: "POST",
        path: "/" + path.split("com/")[1],
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
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
            reject("timeout")
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.write(postData);
        req.end();
    })
}
Http.get = async (path) => {
    let options = {
        protocol: path.split(":")[0] + ":",
        host: path.split("//")[1].split("/")[0],
        //port: "3000",
        method: "POST",
        path: "/" + path.split("com/")[1],
        headers: {
            'Content-Type': 'application/json',
        }
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
            reject("timeout")
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.end();
    })
}
Https.post = async (path, args) => {
    let data = args || {};
    let postData = JSON.stringify(data);
    let options = {
        protocol: path.split(":")[0] + ":",
        host: path.split("//")[1].split("/")[0],
        //port: "3000",
        method: "POST",
        path: "/" + path.split("com/")[1],
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    return new Promise((resolve, reject) => {

        let req = https.request(options, (res) => {
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
            reject("timeout")
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.write(postData);
        req.end();
    })
}
Https.get = async (path) => {
    let options = {
        protocol: path.split(":")[0] + ":",
        host: path.split("//")[1].split("/")[0],
        //port: "3000",
        method: "POST",
        path: "/" + path.split("com/")[1],
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    return new Promise((resolve, reject) => {

        let req = https.request(options, (res) => {
            let data = "";
            res.setEncoding('utf-8');
            res.on("data", (chunk) => {
                console.log(chunk);
                data += chunk;
            })
            res.on("end", () => {
                resolve(data);
            })
        })

        req.setTimeout(timeout, () => {
            reject("timeout")
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.end();
    })
}

const addLegoBrick = async(name, desc) =>{
    let morArgs = {
        "name": name,
        "desc": desc,
        "tag": "",
        "created_at": new Date().getTime(),
        "size": 0
    }
    let result = await Http.post("http://chatbot.api.talkmoment.com/lego/library/legobrick/post?version=002", morArgs);
    console.log(typeof(result))
    return result;
}
const deleteLegoBrick = async(brick_id) =>{
    let result = await Http.post("http://chatbot.api.talkmoment.com/lego/library/legobrick/del?brick_id=" + brick_id + "&version=002");
    return result;
}
const readLegoFirst = async (brick_id) => {
    let result = await Http.post("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id="+ brick_id +"&id_start=99999999&limit=1&version=002");
    return result;
}

let Queue = {}
Queue.postDataToMessage = async (queueName, data) => {
    return await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${queueName}`, data);
};
Queue.getDataFromMessage = async (queueName) => {
    return await getApi(`http://bee.api.talkmoment.com/message/subscribe/try?topic=${queueName}`)
}
Queue.clear = async (queueName) => {
    while(true){
        await Queue.getDataFromMessage(queueName);
    }
    return null;
}
Queue.detail = async (queueName, limit) => {
    let result = await getApi("http://bee.api.talkmoment.com/message/detail?topic=" + queueName + "&limit=" + limit +"&offset=0");
    return  result;
}
Queue.size = async (queueName) => {
    let result = await getApi("http://bee.api.talkmoment.com/message/status");
    result =  result.result[0];
    let size = 0;
    for(let i = 0; i < result.length; i++){
        if(result[i].topic === queueName){
            size = result[i].topic;
            break;
        }
    }
    return size;
}

let Task = {};
Task.fetchTask = (name) => {
    return new Promise(async(resolve, reject) => {
        try{
            let task = await Http.post(`http://bee.api.talkmoment.com/scheduler/task/fetch?name=${name}`);
            task = JSON.parse(task);
            task = task.result;
            if (task.id === 0) throw new Error("暂时没有任务");
            resolve(task);
        }catch(e){
            reject(e)
        }
    })
};
Task.putTaskData = async(task) => {
    let query = {
        task_id: task.id,
        data: task.data
    };
    await Http.post(`http://bee.api.talkmoment.com/scheduler/task/data/put`, query);
};
Task.resolveTask = async(task) => {
    await Http.post(`http://bee.api.talkmoment.com/scheduler/task/resolve?task_id=${task.id}`);
};
Task.callClean = async(task) => {
    await Http.post(`http://bee.api.talkmoment.com/scheduler/task/resolve?task_id=${task.id}`);
}
Task.rejectTask = async(task, err) => {
    let query = {
        task_id: task.id,
        reason: err.stack || "N/A"
    };
    await Http.call(`http://bee.api.talkmoment.com/scheduler/task/reject`, query);
};

exports.Fetch = {
    getApi: getApi,
    getPage: getPage,
    getXml: getXml
}
exports.Http = Http;
exports.Https = Https;
exports.Lego = {
    addLegoBrick: addLegoBrick,
    deleteLegoBrick: deleteLegoBrick,
    readLegoFirst: readLegoFirst
}
exports.Queue = Queue;
exports.Task = Task;