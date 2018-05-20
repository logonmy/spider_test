//14125 16195
const lego = require("./api/lego").Lego;
const Http = require("./api/http").Http;
const File = require("fs")


const getOne = async (brick_id, id_start) => {
    let href = "http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id="+ brick_id +"&id_start=" + id_start + "&limit=1000&version=002";
    let re = await Http.get(href);
    re = JSON.parse(re);
    console.log(re.result[0])
    return re;
}

const getAll = async (brick_id) => {
    let id_start;
    let datas = [];

    let href = "http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id="+ brick_id +"&id_start=99999999&limit=1000&version=002";
    let re = await Http.get(href);
    re = JSON.parse(re);
    datas = datas.concat(re.result);

    console.log(re.result[0]);

    while(re.result && re.result.length > 999){
        id_start = re.result[re.result.length -1].id;
        re = await getOne(brick_id, id_start);
        datas = datas.concat(re.result);
    }
    return datas;
}

const run = async () => {
    for(let i= 16097;i< 16196; i++){
        console.log("#############正在拿  ",i, "################");
        let results = await getAll(i);
        console.log(results.length);
        let write = {
            brick_id: i,
            messageIds: []
        }
        for(let re of results){
            write.messageIds.push(JSON.parse(re.T).messageId)
        }
        File.appendFileSync("tett.txt", JSON.stringify(write) + "\n");
    }
}
run();