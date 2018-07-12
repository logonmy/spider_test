const readLine = require("lei-stream").readLine;
const File = require("fs");
let res = {};
let all = new Set();

Array.prototype.JSONSortBy = function (key) {
    let self = this;
    for (let i = 0; i < self.length; i++) {
        for (let j = i + 1; j < self.length; j++) {
            // console.log(self[i][key])
            // console.log(self[j][key])
            if (self[i][key] < self[j][key]) {
                let temp = self[j];
                self[j] = self[i];
                self[i] = temp;
            }
        }

    }
    return self;
}

readLine("www.txt").go((data, next) => {
    if (all.has(data)) {
        res[data]++;
    } else {
        all.add(data);
        res[data] = 1;
    }
    next();
}, () => {
    let aas = [];
    for (let re in res) {
        aas.push({name: re, count: res[re]});
    }
    aas = aas.JSONSortBy("count");
    for(let a of aas){
        File.appendFileSync("res.txt", JSON.stringify(a) + "\n");
    }

})