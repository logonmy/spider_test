const Http = require("./api/http").Http
const Https = require("./api/https").Http
const getApi = require("./api/fetch").getApi

var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true})
var jsonBuilder = new xml2js.Builder();

let run = async() => {
    let re = await getApi("https://comment.bilibili.com/38898574.xml")
    xmlParser.parseString(re, function (err, result) {
        //将返回的结果再次格式化
        console.log(result.i.d);
    });

}
run()
