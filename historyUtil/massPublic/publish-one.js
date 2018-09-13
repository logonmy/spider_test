const readLine = require("lei-stream").readLine;
const Http = require("../../nodePart/api/http").Http;
let postOne = async (k) => {
    //即刻 最右 微博 b站点 头条
    const sendTaskUrl = "http://bee.api.talkmoment.com/scheduler/task/post";
    var as = [
        "paopao_detail",
    ];

    for(let a of as){
        let postData = {
            name: a,
            value: k,
            config: JSON.stringify({
                brick_id: 25842,
                publish: true
            }),
            scheduled_at: new Date().getTime()
        }
        console.log(postData);
        await Http.call(sendTaskUrl, postData);
    }
}

(async () => {
    await postOne("http://www.iqiyi.com/lib/s_208809305.html?select=papao");
})()
