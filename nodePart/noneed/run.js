const fetchApi = require("../api/fetch").getApi;
const File = require("fs");

(async() => {

    for (var i = 0; i < 38; i++) {
        if (i == 0) {
            i = "";
        }

        let data = await fetchApi("http://idesign.qq.com/reader/GetContent/site_id/36/page/" + i);
        for (let re of data.data.items) {
            File.appendFileSync("result3.txt", JSON.stringify(re) + "\n")
            console.log("xixi")
        }

        console.log("jajajajhajsgdhjagshjdgahsjgdhja          " , i ,"     sdasdasd     ")
    }
})()
