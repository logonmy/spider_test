//如果你真的要清除队列 请到服务器上操作数据库 别石乐之了

const Task = require("../nodePart/api/task").Task

const KEYWORD_BEE_NAME = "weibo_keyword";
const BIGV_BEE_NAME = "weibo_bigv";
const BIGV_BEE_NAME_ALL = "weibo_bigv_all";

const xing_bang = "wx_xingbang_list";

(async() => {
    let i = 0;
    while(true){
        await Task.fetchTask(xing_bang);
        console.log(i++);
    }

})()
