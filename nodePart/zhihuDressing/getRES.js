const Queue = require("../api/queue").Queue;
const File = require("fs");

(async () => {

    while(true){
        try{
            let re = await Queue.getDataFromMessage("ZHURES")
            File.appendFileSync("ZHURES.txt", re.result + "\n");
            console.log("i am runniung");
        }catch(e){
            console.log(e)
            console.log("whaterver")
        }
    }

})()