let File = require("fs");

let ori = File.readFileSync("result.txt").toString();
let now = File.readFileSync("fin.txt").toString();

ori = ori.split("\n");
now = now.split("\n");

let nowSet = new Set();
for(let n of now){
    n = JSON.parse(n)
    console.log(n.word);
    nowSet.add(n.word);
}

for(let o of ori){
	o = JSON.parse(o);
	console.log(o.word)
	if(!nowSet.has(o.word)){
		File.appendFileSync("tttttttttt.txt", JSON.stringify(o) + "\n");
	}
}

