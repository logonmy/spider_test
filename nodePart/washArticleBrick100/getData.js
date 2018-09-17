const Queue = require("../api/queue").Queue;
const File = require("fs");
;

const parse = (text) => {
    const badWord = ["timeout", "微梦创科网络科技", "举报\n", "广播电视节目制作经营许可证", "微博公益用户协议", "当前的微博客户端版本过低", "微信公众平台运营中心", "免费订阅", "跳过广告", "分享到微信"]
    for(let bad of badWord){
        if(text.indexOf(bad) > -1){
            return false;
        }
    }
    return true;
}



(async () => {  
    let data = await Queue.readAllDateFromMessage("yigemingzieryibalenidongbu");
    data = data.result;
    let count = 0;
    console.log("原有大小", data.length)
    for(let da of data){
        da = JSON.parse(da);
        if(parse(da.brief)){
            count++;
            File.appendFileSync("resultSecond.txt", JSON.stringify(da) + "\n");
        }
    }
    console.log(count)
})()