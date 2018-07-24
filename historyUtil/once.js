const readLine = require("lei-stream").readLine
const Http = require("../nodePart/api/http").Http
let files = ["QQscroll.txt",
    "qq_kandian_update.txt",
    "QQscroll2.txt",
    "sina_index_detail.txt",
    "QQscroll3.txt",
    "toutiao_keyword_detail.txt",
    "bhsb.txt",
    "toutiao_user_detail.txt",
    "bilibili_video_detail.txt",
    "weibo_bigv.txt",
    "doutula_photo_id.txt",
    "weibo_bigv_all.txt",
    "duowanPic_index_detail.txt",
    "weibo_keyword.txt",
    "duowan_news_detail.txt",
    "weibo_operate.txt",
    "haoqixin_index_detail.txt",
    "weibo_operate2.txt",
    "jianshu_index_detail.txt",
    "weibolHot.txt",
    "jianshu_video_detail.txt",
    "wx_public_detail.txt",
    "jike.txt",
    "zhihu_index_detail.txt",
    "pear_index_detail.txt",
    "zuiyou.txt",
    "qntz.txt"]


const postDataToDereplicate = async (value, NAME) => {
    console.log("丢过去的值为", value);
    let query = {
        partition: NAME,
        key: value
    };
    await Http.call(`http://bee.api.talkmoment.com/dereplicate/history/add`, query);
};

let one = async (file) => {
    let NAME = file.split(".")[0];
    console.log("现在正在处理", NAME);
    return new Promise((resolve, reject) => {
        readLine(file).go(async (data, next) => {
            try{
                data = JSON.parse(data);
                await postDataToDereplicate(data.key, NAME);
            }catch(e){
                console.log(e);
            }
            next();
        },() => {
            resolve();
        })
    })
}


(async () => {
    for(let file of files){
        await one(file);
    }
})()
