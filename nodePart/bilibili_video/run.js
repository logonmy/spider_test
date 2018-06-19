const Http = require("../api/http").Http;
const getPage = require("../api/fetch").getPage;
const jsdom = require("jsdom");
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const fetchTask = () => {
    return new Promise(async(resolve, reject) => {
        let timeoutHandler = setTimeout(() => {
            reject("fetchTask超时了")
        }, 5000)
        try{
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/fetch?name=${name}`);
            clearTimeout(timeoutHandler);
            task = JSON.parse(task);
            task = task.result;
            if (task.id === 0) throw new Error("暂时没有任务");
            resolve(task);
        }catch(e){
            reject(e)
        }
    })
}

const postTask = async (task) => {
    return new Promise(async(resolve, reject) => {
        try{
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/fetch?name=${name}`);
            task = JSON.parse(task);
            task = task.result;
            if (task.id === 0) throw new Error("暂时没有任务");
            resolve(task);
        }catch(e){
            reject(e)
        }
    })
}

const fetchUrl = async (url) => {
    let html = await getPage(url);
    //console.log(html);
    let d = new jsdom.JSDOM(html);
    var play = d.window.html5data;
    console.log(play);
    if (play && play.durl) {
        var durl = play.durl[0];
        console.log(durl.url)
    }
    return ;
}

const insert = async () => {
}

const runTask = async (task) => {

}

(async () => {
    // while(true){
    //     try {
    //         let task = await fetchTask();
    //         await runTask(task);
    //     } catch (e) {
    //         console.log(e);
    //         await sleep(5);
    //         continue;
    //     }
    // }
    let url = "https://m.bilibili.com/video/av24530175.html"
    await fetchUrl(url);
})()

