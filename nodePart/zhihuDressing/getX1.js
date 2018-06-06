const readLine = require("lei-stream").readLine;
const File = require("fs");
const Queue = require("../api/queue").Queue

let AID = new Set();
let BID = new Set();
readLine("ZHURES3.txt").go((data, next) => {
    data = JSON.parse(data);
    try{
        let Aid = data.question.url.split("/question/")[1];
        AID.add(Aid);
    }catch(e){}

    try{
        for(let s of data.question.similar_queries){
            BID.add({
                keyword: s.keyword,
                url: s.url.split("stion/")[1]
            });
        }
    }catch(e){}
    console.log("s")
    next();

}, async () => {
    console.log("e")
    console.log(BID);
    let count = 0;
    for(let b of BID){
        if(!AID.has(b.url)){
            b.url = "/question/" + b.url;
            if(b.url.indexOf("unde") > -1 || b.url.indexOf("answer") > -1) continue;
            if(count < 25083){
                count++;
                continue;
            }
            File.appendFileSync("partTwo.txt", JSON.stringify(b) + "\n");
            await Queue.postDataToMessage("ZHH", b);
            console.log(count++);
        }
    }
})