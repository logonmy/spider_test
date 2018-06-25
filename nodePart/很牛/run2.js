const Queue = require("../api/queue").Queue;
const File = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");
const readLine = require("lei-stream").readLine;
const getPage = require("../api/fetch").getPage;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

let getOnePage = async (href) => {
	
	let html = await getPage(href, true);
    let d = new jsdom.JSDOM(html);
	let $ = jq(d.window);
	html = d.window.document.querySelector(".article-content").innerHTML
	// let titles = [];
	// let srcs = [];
	// for(let p of ps){
	// 	console.log(ps.innerText)
	// 	if(innerText.indexOf("[") > -1 || innerText.indexof("【" > -1)){
	// 		if()
	// 	}
	// }
	File.appendFileSync("henniu.txt", html);
	File.appendFileSync("henniu.txt", "\n" + "==这是一个完美的分隔符==" + "\n")

}


let i = 0;
let a = new Set();
readLine("很牛列表.txt").go(async(data, next)=> {
	i++;
	console.log(data);
	if(a.has(data)){
		console.log("已经有了 现在又重复了 卧槽");
		next();
	}
	if(i < 0){
		next();
	}
	console.log(data);
	await getOnePage(data);
	a.add(data);
	next();
})