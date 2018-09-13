const readLine = require("lei-stream").readLine;
const File = require("fs")
readLine("zhongxuedetail.txt").go((data, next) => {
    let q = data;
    try {
        if (q.indexOf("杭州") > -1) {
            console.log(1)
            File.appendFileSync("temp5.txt", q + "\n");
        } else if (q.indexOf("浙江") > -1) {
            // File.appendFileSync("temp3.txt", q + "\n");
        }
    } catch (e) { }
    next()
})