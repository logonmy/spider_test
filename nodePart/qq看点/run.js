const getApi = require("../api/fetch").getApi;
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
    let data = await getLists(uin);
    File.appendFileSync("sd.txt", JSON.stringify(data));
    console.log(data);
})()