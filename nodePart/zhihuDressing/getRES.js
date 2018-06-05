const Queue = require("../api/queue").Queue;
const File = require("fs");

(async () => {
    let i=0;
    while(true){
        try{
            let re = await Queue.readDateFromMessage("ZHURES", i);
            re = re.result[0];
            console.log(i++);
            File.appendFileSync("ZHURES.txt", re + "\n");
        }catch(e){
            console.log(e)
            console.log("whaterver")
        }
    }


})()