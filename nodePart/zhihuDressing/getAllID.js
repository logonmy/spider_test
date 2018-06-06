const readLine = require("lei-stream").readLine
const File = require("fs");

let i =0 ;
let errorCount = 0;

readLine("ZHURES.txt").go((data, next) =>{
    i++;
    data = JSON.parse(data);

    console.log(data.keyword);
    try{
        console.log(data.question.similar_queries[0].keyword)
        if(data.question.similar_queries[0].keyword){
            console.log(data.question.similar_queries[0].keyword)
            data.keyword = data.question.similar_queries[0].keyword;
        }
    }catch(e){
        errorCount++;
        console.log(e)
        console.log("whatever");

    }
    console.log(i);
    File.appendFileSync("ZHURES2.txt", JSON.stringify(data) + "\n");
    next();
}, () => {
    console.log("失败了多少个嫩？" , errorCount);
})