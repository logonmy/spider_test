const readLine =require("lei-stream").readLine;
const File = require("fs");
var os = new Set();

readLine("old.txt").go((data,next) => {
    os.add(data);
    console.log(0)
    next();
}, () => {
    console.log(1)
    let  i =0;
    readLine("new.txt").go((data,next) => {
        if(os.has(data)){
            i++;
            console.log(i)
        }else{
            console.log(2)
            File.appendFileSync("result.txt", data + "\n");
        }
        next();
    })
})