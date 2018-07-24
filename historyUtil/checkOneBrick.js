const getLegoBrickAll = require("../nodePart/api/lego").getLegoBrickAll;
const File = require("fs");

let legoSet = new Set();
let idSet = new Set();

(async () => {
    try {

        let da = await getLegoBrickAll("22821");
        for (let i = 0; i < da.length; i++) {
            let title = da[i].R.split("||")[0];
            if (legoSet.has(title) && !idSet.has(da[i].id)) {
                console.log("###########");
                console.log(title);
            }
            legoSet.add(title);
            idSet.add(da[i].id);

            let data = JSON.stringify(da[i]);
            File.appendFileSync("reeeee724.txt", data + "\n");
        }
    } catch (e) {
        console.log(e)
    }
    console.log("end");
})()