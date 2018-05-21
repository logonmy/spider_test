const readLine = require("lei-stream").readLine;
const lego = require("../api/lego").Lego;

readLine("zuiyou_brick.txt").go((data, next)=> {
    data = JSON.parse(data);
    console.log(data)
    if(data.size > 0){

    }
})