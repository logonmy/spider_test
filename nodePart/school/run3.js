const Queue = require("../api/queue").Queue;
const File =require("fs");
(async () => {
    let result = await Queue.readAllDateFromMessage("234566");
    console.log(result)
    result = result.result;
    for(let re of result){
        File.appendFileSync("download2222.txt", re + "\n");
    }
})()