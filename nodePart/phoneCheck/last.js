const readLine = require("lei-stream").readLine;
const File = require("fs");

let value = {};
readLine("middle.txt").go(async (data, next) => {
    data = JSON.parse(data);

    var a = data.title;
    a = a.substring(1);
    a = a.substr(0, a.length - 3);
    console.log(a);

    if (!value[a]) {
        value[a] = []
    }
    value[a] = value[a].concat(data.haoma);
    next();
}, () => {
    let result = [];
    for (let v in value) {
        result[v] = [];
        for (let d of value[v]) {
            if (d.length <= 7) {
                result[v].push(d);
            }
        }
    }
    for (let v in result) {
        File.appendFileSync("last.txt", JSON.stringify({
            title: v,
            haoma: result[v]
        }) + "\n")
    }
})


