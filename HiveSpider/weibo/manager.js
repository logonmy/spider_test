const child_process = require("child_process");
const Task = require("./api/task").Task;
const Http = require("./api/http").Http;
const Socket = require("./api/socket").Socket;
const File = require("fs")

//todo 微博目前线不考虑 emit与num_item_limit
//todo 微博要把filterItem里面的 url清理干净 ？后面的都踢掉

const KEYWORD_BEE_NAME = "weibo_keyword";
const BIGV_BEE_NAME = "weibo_bigv";
const UPDATE_EVERY_DAY = "weibo_update_everyday";

const filterItems = async (task, data) => {
    console.log(data);
    let query = {
        partition: task.name,
        keys: data.map((item)=>{return item.detailUrl})
    };
    console.log(query);
    let res = await Http.call(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
    res = JSON.parse(res);
    console.log(res);
    data = data.filter((item, i) => (res.result.filter_result[i]));
};

const postDataToMessage = async(task, data) => {
    await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${task.name}`, data);
};

const postDataToDereplicate = async (task, data) => {
    let query = {
        partition: task.name,
        key: data.detailUrl
    };
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
};

const copyJSON = (obj) => {
    var answerObject = {};
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var answer = [];
        for (var i = 0; i < obj.length; i++) {
            answer.push(obj[i]);
        }
        return answer;
    }
    if (typeof(obj) === "object") {
        for (var name in obj) {
            answerObject[name] = copyJSON(obj[name]);
        }
        return answerObject
    } else {
        return obj
    }
}

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

let getUser = (() => {
    let users = [{
            username: "15850766679",
            password: "xrz19940822"
        },{
        username: "15351702865",
        password: "cqcp815"
    }, {
        username: "yuchenguangfd@gmail.com",
        password: "Washu1234"
    }, {
        username: "guyiyang@gmail.com",
        password: "Washu1234"
    }];
    return () => {
        let result = users.shift();
        users.push(result);
        return result;
    }
})();

let TaskHeap = function () {
    this.tasks = [];
    this.readyTasks = [];
    this.weiboBigVCache = {};
    this.weiboBigVTask = [];
}
TaskHeap.prototype.getReadyTask = function() {
    var self = this;
    return self.readyTasks.shift();
}
TaskHeap.prototype.hasReadyTask = function() {
    var self = this;
    return self.readyTasks.length === 0 ? false : true;
}
TaskHeap.prototype.pushTask = function(task) {
    var self = this;
    switch (task.name) {
        case "weibo_keyword": {

            self.readyTasks.push(task);
            break;
        }
        case "weibo_bigv": {

            if(self.weiboBigVCache[task.value]){
                self.weiboBigVCache[task.value].push(task);
            }else{
                self.weiboBigVCache[task.value] = [];
                self.weiboBigVCache[task.value].push(task);
            }
            if(task.end){
                //todo 每页返回的都是一个task
                delete task.end;
                let datas = [];
                for(let tk in self.weiboBigVCache){
                    for(let data of self.weiboBigVCache[tk]){
                        for(da of data.datas){
                            datas.push(da);
                        }
                    }
                }
                task.datas = datas;

                File.appendFileSync("task.txt", JSON.stringify(task));
                self.readyTasks.push(task);
                console.log(self.readyTasks.length, "LLLLLLLLLL");

                delete self.weiboBigVCache[task.name];
            }
            break;
        }
        case "weibo_update_everyday": {
            //todo
            break;
        }
    }
}
TaskHeap.prototype.addBigVTask = function(task){
    var self = this;
    self.weiboBigVTask.push(task);
}
TaskHeap.prototype.hasBigVTask = function(){
    var self = this;
    return self.weiboBigVTask.length > 0 ? true : false;
}
TaskHeap.prototype.getBigVTask = function(){
    var self = this;
    console.log("###########目前的TASK队列", self.weiboBigVTask.length);
    return self.weiboBigVTask.shift();
}

let taskHeap = new TaskHeap();

class Cpu {
    constructor(fileName, user) {
        this.worker = child_process.fork(fileName);
        this.user = user;
        this.task = void 0;
        this.data = [];
        this._status = false;
    }
    set status(value) {
        if (!value) {
            this._status = false;
        }
        else {
            this._status = true;
        }
    }
    get status() {
        return this._status;
    }
    init(timeout = 300) {
        let self = this;
        timeout = timeout * 1000;

        let keywordCount = 0;

        self.worker.on("message", async (task) => {
            switch (task.type) {
                //一个关键词只有一个对应的success过来
                //一个微博博主历史有博主历史页数个success过来
                case "success": {
                    self.status = true;
                    taskHeap.pushTask(task);
                    break;
                }
                case "error": {
                    await Task.rejectTask(task, "error");
                    self.status = true;
                    break;
                }
                case "bigVInit": {
                    self.status = true;

                    for(let i = 1;i< task.pageCount + 1; i++){
                        let taskCopy = copyJSON(task);
                        taskCopy.currentUrl = task.baseUrl + "&page=" + i;
                        taskCopy.page = i;
                        taskHeap.addBigVTask(taskCopy);
                    }

                    break;
                }
            }
        })
        self.worker.on("exit", async () => {
            //todo 重启 重新init
            //暂时不知道怎么做
        })

        return new Promise((resolve, reject) => {
            console.log("监听启动函数注册");
            self.worker.on("message", (msg) => {
                if (msg.type === "launched") {
                    console.log("puppeteer已启动 发送用户名与密码", self.user);
                    self.worker.send({
                        name: "user",
                        user: self.user
                    })
                } else if (msg.type === "login") {
                    console.log("登录成功， 开放一个puppeteer实例");
                    self.status = true;
                    self.cache = [];
                    resolve();
                }
            })

            setTimeout(function () {
                reject();
            }, timeout)
        })
    }

    work(task) {
        let self = this;
        self.status = false;
        self.task = task;
        this.worker.send(task);
    }
}

//有puppetter空闲时 发出轮询
run = async () => {
    let Puppeteers = await (async () => {
        //array content all Cpu instance
        let Cpus = [];

        //init all Cpu and login return a Promise
        let init = async () => {
            let loginPromises = [];
            for (let i = 0; i < 4; i++) {
                Cpus.push(new Cpu("worker.js", getUser()));
                loginPromises.push(Cpus[i].init());
            }
            await Promise.all(loginPromises);
        }

        //check if there is free Cpu return a boolean
        let hasFreePuppeteer = () => {
            for (let i = 0; i < Cpus.length; i++) {
                if (Cpus[i].status === true) {
                    return true;
                }
            }
            return false;
        }

        //return one free Cpu instance or false
        let getFreePuppeteer = () => {
            for (let i = 0; i < Cpus.length; i++) {
                if (Cpus[i].status === true) {
                    Cpus[i].status === false;
                    return Cpus[i]
                }
            }
            return false;
        }

        //run one task with task in json
        let runTask = (task) => {
            let puppeteer = getFreePuppeteer();

            if (!puppeteer) return;

            if (task.name === "weibo_keyword" || "weibo_bigv" || "weibo_update_everyday") {
                getFreePuppeteer().work(task);
            } else {
                console.log("unKnow TaskName");
            }
        }

        //ask for tasks and run them 目测不需要这个东西了 命令由gettask下发过来都 所以不需要puppeteers去请求 把请求又从puppeteers里面分割出来了
        let fetchAndRunTask = async () => {
            let tasks = await getTask();
            for (let i = 0; i < tasks.length; i++) {
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

    //轮询服务器 获取任务
    (async () => {
        console.log("轮询服务器启动");
        const SLEEP_TIME = 10;
        //todo 更好的写法？？
        while (true) {
            if (Puppeteers.hasFreePuppeteer()) {
                if(taskHeap.hasBigVTask()){
                    let task = taskHeap.getBigVTask();
                    Puppeteers.runTask(task);
                }else{
                    let task = await Task.fetchTask(KEYWORD_BEE_NAME);
                    if (task === null) {
                        let task2 = await Task.fetchTask(BIGV_BEE_NAME);
                        if (task2 === null) {
                            let task3 = await Task.fetchTask(UPDATE_EVERY_DAY);
                            if (task3 === null) {
                                //console.log("暂时没有任务");

                                await sleep(SLEEP_TIME);
                                continue;
                            } else {
                                console.log("获得每日更新任务");
                                Puppeteers.runTask(task3);
                                continue;
                            }
                        } else {
                            console.log("获得大v历史详情任务");
                            Puppeteers.runTask(task2);
                            continue;
                        }
                    } else {
                        console.log("获得关键词搜索任务");
                        Puppeteers.runTask(task);
                        continue;
                    }
                }

            }else{
                console.log("暂时没有空闲puppeteer instance");
            }
            await sleep();
        }
    })();

    //轮询task 获取已完成任务 并上传
    (async () => {
        console.log("轮询Task队列启动");
        while (true) {
            console.log("轮询Task队列队列队列");
            if (taskHeap.hasReadyTask()) {
                let task = taskHeap.getReadyTask();
                //todo taskSolve
                console.log("todooooo")

                await filterItems(task, task.datas);

                for(let data of task.datas){
                    let taskCopy = copyJSON(task);
                    console.log(data);
                    taskCopy.data = JSON.stringify(data);
                    delete taskCopy.datas;
                    await Task.putTaskData(taskCopy);
                    Socket.log(`提交爬取任务结果数据完成`);

                    Socket.log(`发送爬取结果到消息队列topic=${task.name}`);
                    await postDataToMessage(task, data);
                    Socket.log(`发送爬取结果到消息队列完成`);

                    Socket.log(`添加内容url(${data.url})到去重模块的历史集合`);
                    await postDataToDereplicate(task, data);
                    Socket.log(`添加到去重模块成功`);

                    Socket.log(`上报爬取任务成功,task=`, task.stack);
                    await Task.resolveTask(task);
                }

                // Socket.emitEvent({
                //     event: "list_item_finish",
                //     bee_name: task.name
                // });

                console.log("一个关键词爬取完成 开放一个puppeteer实例");

                await sleep(5);

            } else {
                console.log("暂时没有已完成的task");
                await sleep(10);
            }
        }
    })();
}
run();