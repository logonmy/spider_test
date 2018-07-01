const getApi = require("../api/fetch").getApi;
const File = require("fs");

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

(async () => {
    let start = 1;
    while (true) {
        start = start + 22;
        console.log(start);
        let data = await getApi("http://www.soogif.com/material/query/?query=%E4%B8%96%E7%95%8C%E6%9D%AF%E7%90%83%E6%98%9F&sortField=timestamp_0&start=" + start + "&size=22&imageType=0")
        console.log(data);
        console.log(data.data.list);
        for (let li of data.data.list) {
            File.appendFileSync("re.txt", JSON.stringify(li) + "\n");
        }
        await sleep(2);
    }
})()
