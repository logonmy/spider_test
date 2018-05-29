const Queue = require("../api/queue").Queue;


(async () => {
    let a = new Set();
    let b = []
    let data = await Queue.readAllDateFromMessage("ZHHHHH")
    console.log(data);

    for(let re of data.result){
        re = JSON.parse(re);
        re.url = re.url.split("/answer")[0];
        if(!a.has(re.url)){
            a.add(re.url);
            b.push(JSON.stringify(re));
        }else{
            console.log("抓到一个坏b", re.url);
        }
    }

    for(let v of b){
        await Queue.postDataToMessage("ZHH", v);
    }

})()
