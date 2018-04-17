const child_process = require("child_process");
const http = require("http");
const Task = require("./api/task").Task
const Http = require("./api/http").Http


const filterItems = async(task, data) => {
    let query = {
        partition: task.name,
        keys: data
    };
    let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
    res = JSON.parse(res);
    data = data.filter((item, i) => (res.result.filter_result[i]));
};

const postDataToDereplicate = async(task, data) => {
    let query = {
        partition: task.name,
        key: data.detailUrl
    };
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
};

const copyJSON = (obj) => {
    var answerObject = {};
    if(Object.prototype.toString.call(obj) === '[object Array]'){
        var answer = [];
        for(var i = 0;i< obj.length;i++){
            answer.push(obj[i]);
        }
        return answer;
    }
    if(typeof(obj) === "object"){
        for(var name in obj){
            answerObject[name] = copyObject(obj[name]);
        }
        return answerObject
    }else{
        return obj
    }
}

const sleep = (s=5) => {
    return new Promise(resolve => setTimeout(resolve, s * c000))
}

let getUser = (() => {
    let users = [{
        username: "15351702865",
        password: "cqcp815"
    }, {
        username: "yuchenguangfd@gmail.com",
        password: "Washu1234"
    }, {
        username: "guyiyang@gmail.com",
        password: "Washu1234"
    }, {
        username: "15850766679",
        password: "xrz19940822"
    }];
    return () => {
        let result = users.shift();
        users.push(result);
        return result;
    }
})();

class Cpu{
    constructor(fileName, user){
        this.worker = child_process.fork(fileName);
        this.user = user;
        this.task = void 0;
        this.data = [];
        this._status = false;
    }
    set status(value) {
        if (!value){
            this._status = false;
        }
        else{
            this._status = true;
        }
    }

    get status(){
        return this._status;
    }

    init(timeout = 300) {
        let self = this;
        timeout = timeout * 1000;

        let keywordCount = 0;

        self.worker.on("message", async (task) => {
            if(task.name === "weibo_keyword"){
                switch (task.type){
                    case "success": {
                        //拿detialUrl去重filter
                        let datas = task.datas;
                        let dataUrls = [];
                        for(let data of datas){
                            dataUrls.push(data.detailUrl);
                        }
                        await filterItems(self.task, dataUrls);
                        let resultDatas = [];
                        for(let dataUrl of dataUrls){
                            for(let data of datas){
                                if(data.detailUrl === dataUrl){
                                    resultDatas.push(data)
                                    break;
                                }
                            }
                        }

                        //拿分开的data post上去 去重提交
                        for(let data of resultDatas){
                            task.data = JSON.stringify(data);
                            await Task.putTaskData(task);
                            await postDataToDereplicate(task, data);
                        }
                        console.log("一个关键词爬取完成 开放一个puppeteer实例");
                        self.status = true;
                    }
                    case "error": {
                        await Task.rejectTask(task, "error");
                        self.status = true;
                    }
                }
            }else if(task.name === "weibo_bigv"){

            }else if(task.name === "weibo_update_everyday"){

            }

        })
        self.worker.on("exit", async() => {
            //todo 重启 重新init
            //暂时不知道怎么做
            //cpu应该是无法接触到puppeteers的 同时也就无法接触到其中的Cpus数组
        })

        return new Promise((resolve, reject) =>{
            console.log("监听启动函数注册");
            self.worker.on("message", (msg) => {
                if(msg.type === "launched"){
                    console.log("puppeteer已启动 发送用户名与密码", self.user);
                    self.worker.send({
                        name: "user",
                        user: self.user
                    })
                }else if(msg.type === "login"){
                    console.log("登录成功， 开放一个puppeteer实例");
                    self.status = true;
                    self.cache = [];
                    resolve();
                }
            })

            setTimeout(function(){
                reject();
            }, timeout)
        })
    }

    work(task){
        let self = this;
        self.task = task;
        this.worker.send(task);
    }
}

//有puppetter空闲时 发出轮询
run = async () => {
    let Puppeteers = await (async() =>{
        //array content all Cpu instance
        let Cpus = [];

        //init all Cpu and login return a Promise
        let init = async () => {
            let loginPromises = [];
            for(let i = 0; i < 1; i++){
                Cpus.push(new Cpu("worker.js", getUser()));
                loginPromises.push(Cpus[i].init());
            }
            await Promise.all(loginPromises);
        }

        //check if there is free Cpu return a boolean
        let hasFreePuppeteer = () => {
            for(let i =0;i< Cpus.length;i++){
                if(Cpus[i].status === true){
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

        //run one task with task in json
        let runTask = (task) => {
            let puppeteer = getFreePuppeteer();

            if(!puppeteer) return;

            if(task.name === "weibo_keyword" || "weibo_bigv" || "weibo_update_everyday"){
                getFreePuppeteer().work(task);
            }else{
                console.log("unKnow TaskName");
            }
        }

        //ask for tasks and run them 目测不需要这个东西了 命令由gettask下发过来都 所以不需要puppeteers去请求 把请求又从puppeteers里面分割出来了
        let fetchAndRunTask = async () => {
            let tasks = await getTask();
            for(let i = 0;i<tasks.length;i++){
                runTask(tasks[i].name, tasks[i].value, tasks[i].taskId);
            }
        }

        return {
            init: init,
            hasFreePuppeteer: hasFreePuppeteer,
            fetchAndRunTask: fetchAndRunTask,
            runTask: runTask
        }
    })()

    //初始化
    await Puppeteers.init();

    //轮询
    (async() => {
        const KEYWORD_BEE_NAME = "weibo_keyword";
        const BIGV_BEE_NAME = "weibo_bigv";
        const UPDATE_EVERY_DAY = "weibo_update_everyday";
        const SLEEP_TIME = 10;
        //todo 更好的写法？？
        while (true) {
            if(Puppeteers.hasFreePuppeteer()){
                let task = await Task.fetchTask(KEYWORD_BEE_NAME);
                if (task === null) {
                    let task2  = await Task.fetchTask(BIGV_BEE_NAME);
                    if(task2 === null){
                        let task3 = await Task.fetchTask(UPDATE_EVERY_DAY);
                        if(task3 === null){
                            console.log("暂时没有任务");

                            await sleep(SLEEP_TIME);
                            continue;
                        }else{
                            console.log("获得每日更新任务");
                            Puppeteers.runTask(task3);
                            continue;
                        }
                    }else{
                        console.log("获得大v历史详情任务");
                        Puppeteers.runTask(task2);
                        continue;
                    }
                }else{
                    console.log("获得关键词搜索任务");
                    Puppeteers.runTask(task);
                    continue;
                }
            }
            console.log("暂时没有空闲puppeteer instance");
            await sleep();
        }
    })()
}

run();