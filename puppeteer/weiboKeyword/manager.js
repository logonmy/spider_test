const child_process = require("child_process");
const https = require("https");

/*
    对于关键词 一个pupeteer跑一个关键词
    对于博主 可以实现 多个puppeteer跑一个博主 但为了简单 还是一个puppeteer跑一个 以后估计也不可能优化了
    以上意味着 一个puppeteer一个taskId

    S-M-W

    所有数据传输格式
    {
        name: ,
        value: ,
        taskId: ,
    }
*/
config = {
    request1: {
        url: "keyword请求的url",
        data: {
            name: "weiboKeyword"
        }
    },
    request2: {
        url: "BigV请求的url",
        data: {
            name: "weiboBigV"
        }
    }
}

const sleep = (s=5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}
class EventEmitter{
    constructor(){
        this.events = {}
    }
    on(eventName, callback){
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(callback);
    }
    emit(eventName, callback){
        let events = this.events[eventName];
        let args = Array.prototype.slice.call(arguments, 1)
        if(!events) return;
        for(let i =0;i < events.length;i++){
            events[i].apply(null, args);
        }
    }
}
class Queue{
    constructor(){
        this.queue = []
    }
    push(data){
        this.queue.push(data);
    }
    pop(data){
        if(this.queue.length > 0){
            return this.queue.shift();
        }else {
            return false;
        }
    }
}
class Cpu{
    //因为不用继承什么 感觉不需要一个类
    constructor(fileName, user){
        this.worker = child_process.fork(fileName);
        this.user = user;
    }

    on(msg, callback) {
        this.worker.on(msg, callback.call(this));
    }

    init(timeout = 30) {
        let self = this;
        timeout = timeout * 1000;

        self.worker.on("message", async (m) => {
            if(m.name === "keyword"){

            }else if(m.name === "bigV"){

            }
            switch (m.type){
                case "success": {
                    //todo
                    self.status = true;
                    EventEmitter.emit("freeChange");
                }
                case "error": {
                    //todo
                    self.status = true;
                    errorQueue.push({
                        name: e.name,
                        value: e.value,
                        taskId: e.taskId
                    })
                    EventEmitter.emit("freeChange");
                }
            }
        })
        self.worker.on("exit", async() => {
            //暂时不知道怎么做
            //cpu应该是无法接触到puppeteers的 同时也就无法接触到其中的Cpus数组
        })

        return new Promise((resolve, reject) =>{
            self.worker.on("launched", () => {
                self.worker.send({
                    type: "user",
                    user: self.user
                })
            })
            self.worker.on("login", () => {
                self.status = true;
                self.cache = [];
                resolve();
            })
            setTimeout(() => {
                reject();
            }, timeout)
        })
    }

    get status(){
        return this.status;
    }
}

let errorQueue = new Queue();
let EventEmitter = new EventEmitter();

let httpsRequest = async (url, data) => {
    let options = {
        url: url,
        method: "POST",
        data: data
    }
    return new Promise((resolve, reject) => {
        https.request(options, (res) => {
            let data = "";
            res.setEncoding('utf-8');
            res.on("data", (chunk) => {
                data += chunk;
            })
            res.on("end", () => {
                resolve(data);
            })
            res.on("error", (e) => {
                reject(e);
            })
        })
    })
}
let httpsResponse = async (url, data) => {
    let options = {
        url: url,
        method: "POST",
        data: data
    }
    return new Promise((resolve, reject) => {
        https.request(options, (res) => {
            let data = "";
            res.setEncoding('utf-8');
            res.on("data", (chunk) => {
                data += chunk;
            })
            res.on("end", () => {
                resolve(data);
            })
            res.on("error", (e) => {
                reject(e);
            })
        })
    })
}

//有puppetter空闲时 发出轮询
run = async () => {
    //return tasksArray
    let getTask = async() => {
        let returnData = [];
        let get = async (array) => {
            let result;
            for(let i=0;i<array.length;i++){
                result = await httpsRequest(array[i].url,array.data);
                if(result.value){
                    break;
                }
            }
            if(result.value){
                returnData.push({
                    value: result.value,
                    name: result.name,
                    taskId: result.taskId
                });
                if(Puppeteers.hasFreePuppeteer){
                    await get();
                }
            }
            else{
                console.log("没有空闲puppeteer 或 任务队列为空");
                await sleep();
            }
        }
        await get();
        return returnData;
    }

    let Puppeteers = await (async() =>{
        let self = this;
        //array content all Cpu instance
        let Cpus = [];

        //init all Cpu and login return a Promise
        let init = async () => {
            let loginPromises = [];
            for(let i = 0; i < 4; i++){
                Cpus.push(new Cpu("worker.js"))
                loginPromises.push(Cpus[i].init());
            }
            await Promise.all(loginPromises);
        }

        //check if there is free Cpu return a boolean
        let hasFreePuppeteer = () => {
            for(let i =0;i< Cpus.length;i++){
                if(Cpus['i'].status === true){
                    return true;

                }
            }
            return false;
        }

        //return one free Cpu instance or false
        let getFreePuppeteer = () => {
            for(let i = 0; i< Cpus.length; i++){
                if(Cpus[i].status === true){
                    Cpus[i].status === false;
                    return Cpus[i]
                }
            }
            return false;
        }

        //run one task with name value and taskId
        let runTask = (taskType, data, taskId) => {
            let puppeteer = getFreePuppeteer();
            if(!puppeteer) return;

            if(taskType === "keyword" || taskType === "BigVHistory"){
                let worker = self.getFreePuppeteer();
                worker.send({
                    type: taskType,
                    data: data,
                    taskId: taskId
                })
            }else{
                console.log("unKnow TaskName");
            }
        }

        //ask for tasks and run them
        let fetchAndRunTask = async () => {
            let tasks = await getTask();
            for(let i = 0;i<tasks.length;i++){
                runTask(tasks[i].name, tasks[i].value, tasks[i].taskId);
            }
        }

        return {
            init: init,
            hasFreePuppeteer: hasFreePuppeteer(),
            fetchAndRunTask: fetchAndRunTask
        }
    })()

    //登陆
    await Puppeteers.init();

    await Puppeteers.fetchAndRunTask();
    //worker success/error事件出发freeChange
    EventEmitter.on("freeChange", async function(){
        await Puppeteers.fetchAndRunTask();
    })

}