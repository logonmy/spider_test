const readLine = require("lei-stream").readLine;
const File = require("fs");


var a = new Set();
readLine("4.txt").go(async(data, next) => {
	data = JSON.parse(data);
	if(a.has(data.src)){
		next()
	}else{
		a.add(data.src);
		if(data.title.indexOf("博海拾贝") > -1){
			console.log("坏了")
			next()
		}else{
			if(!data.src) next();
			File.appendFileSync("很牛帮.txt" ,JSON.stringify(data) + "\n")
			next();
		}
	}
})