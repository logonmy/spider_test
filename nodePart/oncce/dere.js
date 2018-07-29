const readLine = require("lei-stream").readLine
const File = require("fs");

Array.prototype.JSONSortBy = function (key) {
    let self = this;
    for (let i = 0; i < self.length; i++) {
        for (let j = i + 1; j < self.length; j++) {
            if (self[i][key] < self[j][key]) {
                let temp = self[j];
                self[j] = self[i];
                self[i] = temp;
            }
        }
    }
    return self;
}
let wordSet = new Set();
let toSort = [];
let d = File.readFileSync("tt1.txt");
d = d.toString();
d = d.split("\n");
for(let data of d){
	data = JSON.parse(data);
	if(!wordSet.has(data.word)){
		console.log(data.word);
		wordSet.add(data.word);
		toSort.push(data);
	}
}
toSort = toSort.JSONSortBy("pv");
for(let s of toSort){
	File.appendFileSync("result.txt", JSON.stringify(s) + "\n");
}