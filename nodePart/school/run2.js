const readLine = require("lei-stream").readLine;
const iconv = require('iconv-lite');
const request = require('request');
const jsdom = require("jsdom");
const File = require("fs");
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const getDetail = async (href) => {
	return new Promise((resolve, reject) => {
	 	request.get(href).pipe(iconv.decodeStream('gbk')).collect(function(err, body) {
	 		try{
	 			let d = new jsdom.JSDOM(body);
		        let b = {};
		        let document = d.window.document;

		        b.name = document.querySelector("title").innerHTML.split("评分")[0];
		        b.pic = document.querySelector(".school_img_tu img").getAttribute("src");
		        b.desc = document.querySelector(".school_t").innerHTML
		        File.appendFileSync("zhongxuedetail.txt", JSON.stringify(b) + "\n");
		        resolve(b);
	 		}catch(e){
	 			console.log(e);
	 			console.log("程序退出");
	 			process.exit();
	 		}
	    });
	})
}
let count = 0;
let stop = parseInt(File.readFileSync("stop.txt").toString());

readLine("zhongxue.txt").go(async (data, next) => {
	if(count < stop){
		count++;
	}else{
		try{
			console.log("#################");
			console.log(data, "开始跑");
			let timeout = setTimeout(function(){
				process.exit();
			}, 5000)
			await getDetail(data);	
			clearTimeout(timeout);
			console.log(data, "已完成");
			stop = stop + 1;
			File.writeFileSync("stop.txt", stop);
		}catch(e){
			console.log(e)
		}
	}
	next();
})