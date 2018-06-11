const readLine = require("lei-stream").readLine;
const Http = require("../../nodePart/api/http").Http;
let postOne = async (k) => {
    //即刻 最右 微博 b站点 头条
    const sendTaskUrl = "http://bee.api.talkmoment.com/scheduler/task/post";
    var as = ["bilibili_keyword_list",
    "weibo_keyword",
    "toutiao_keyword_list",
    "jike_topic_keyword",
    "zuiyou_keyword"];

    for(let a of as){
        let postData = {
            name: a,
            value: k,
            config: JSON.stringify({
                brick_id: 18774
            }),
            scheduled_at: new Date().getTime()
        }
        console.log(postData);
        await Http.call(sendTaskUrl, postData);
    }
}
readLine("topic_uniq.txt").go(async (data, next) => {
    data = JSON.parse(data);
    console.log(data.text);
    await postOne(data.text);
    next();
})
