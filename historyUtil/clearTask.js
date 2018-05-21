const Task = require("../nodePart/api/task").Task

const KEYWORD_BEE_NAME = "weibo_keyword";
const BIGV_BEE_NAME = "weibo_bigv";
const BIGV_BEE_NAME_ALL = "weibo_bigv_all";

(async() => {
    while(true){
        let task;
        console.log(task, "  keyword")
        console.log(task, "  bigV")
        await Task.fetchTask(BIGV_BEE_NAME_ALL)
        console.log(task, "  bigVAll")
    }

})()