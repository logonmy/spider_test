const readLine = require("lei-stream").readLine

let search = new Set();
readLine("resultFirst.txt").go((data, next) => {
    try {


        data = data.split("//")[1].split("/")[0]
        search.add(data);
    } catch (e) { }
    next()
}, () => {
    let count =0;
    for (let s of search) {
        console.log(s);
        count++
    }
    console.log(count)
})