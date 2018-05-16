const Http = require("./api/http").Http
const Https = require("./api/https").Http
const getApi = require("./api/fetch").getApi
const xml2js = require('xml2js');
const readLine = require("lei-stream").readLine;
const File = require("fs");

var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true})

readLine("2.txt").go(async(data, next) => {
    data = JSON.parse(data);
    let re = await getApi("https://comment.bilibili.com/" + data.cid +".xml");
    xmlParser.parseString(re, function (err, result) {
        console.log(result.i.d);
        data.danmu = result.i.d;
        File.appendFileSync("result2.txt", JSON.stringify(data)+ "\n");
    });
    setTimeout(function(){
        next()
    },1000)
})

