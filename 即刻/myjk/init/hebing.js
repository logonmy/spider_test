const readLine = require("lei-stream").readLine
const File = require("fs");

let created_ats = [];
let nowNeeds = [];

readLine("created_at.txt").go((data, next)=> {
    data = JSON.parse(data);
    created_ats.push(data)
    next();
}, () => {
    readLine("allNeed.txt").go((data, next) => {
        data = JSON.parse(data);
        nowNeeds.push(data);
        next();
    }, () => {
        for(let c of created_ats){
            for(let n of nowNeeds){
                if(c.brick_id === n.brick_id){
                    File.appendFileSync("update.txt", JSON.stringify({brick_id: c.brick_id, topic_id: n.topic_id}) + "\n")
                    break;
                }
            }
        }
    })
})