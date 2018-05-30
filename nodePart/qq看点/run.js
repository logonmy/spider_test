const getApi = require("../api/fetch").getApi;
const Queue = require("../api/queue").Queue;
const File = require("fs")

const getComments = async(uin,feeds_id) => {
    let data = await getApi("http://kandian.qq.com/qz_kandian_social/kandian_ext/GetCommentListV2?uin=" + uin + "&feeds_id=" + feeds_id + "&feedsType=12&startIndex=0&reqCount=20");
    return data;
}

let getLists = async(uin) => {
    let data = await getApi("http://kandian.qq.com/cgi-bin/social/getHomePage?uin=" + uin + "&pageNo=1&pageSize=10")
    return data;
}


let uin = "2363622731";
let feed_ids = "16098934180474418474";


(async ()=> {

    let data = await Queue.readAllDateFromMessage("qqKandian3");
    console.log(data.result);
    for(let r of data.result){
        File.appendFileSync("201.txt", r + "\n");
    }
})()

