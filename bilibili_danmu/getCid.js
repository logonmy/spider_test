const Http = require("./api/http").Http
const Https = require("./api/https").Http
const getApi = require("./api/fetch").getApi
const File = require("fs");
const readLine = require("lei-stream").readLine

readLine("1.txt").go(async(data, next) => {
    data = JSON.parse(data);
    let re = await getApi(data.url);
    let patt = /\"pages\":\[{\"cid\":[0-9]*/i;
    try{
        let av = re.match(patt)[0]
        av = av.split(":")[2]
        console.log(av);
        data.cid = av;
        File.appendFileSync("2.txt", JSON.stringify(data) + "\n")
    }catch(e){
        console.log(e)
    }
    setTimeout(function(){
        next();
    }, 2000)

})