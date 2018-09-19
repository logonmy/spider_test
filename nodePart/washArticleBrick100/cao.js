const readLine = require("lei-stream").readLine
const File = require("fs");

readLine("article.txt").go((data, next) => {
    data = JSON.parse(data);
    try {
        console.log(data.id)
        File.appendFileSync("adfgjsvhjkdsagfukqwre.txt", data.id + "\n");
        let rs = data.R.split("||");
        let url = "";
        for (let r of rs) {
            console.log("我开始了");
            try {
                r = JSON.parse(r)
                url = r.url;
                break;
            } catch (e) { }
        }
        console.log(url)
    } catch (e) {
        console.log(data)
        console.log(e)
    }
    next()
})