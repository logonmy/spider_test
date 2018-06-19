const File = require("fs");
const readLine = require("lei-stream").readLine;
const host = "http://www.shuoshuokong.com";


let content = [];
readLine("shuoshuo.txt").go(async (data, next) => {
    content.push(data);
    next();
}, () => {
    for(let i=0;i< content.length;i++){
        if(content[i].indexOf("img") > -1){
            let data = {
                title: content[i -1],
                src: content[i]
            }
            File.appendFileSync("result.txt", JSON.stringify(data) + "\n");
        }
    }
})