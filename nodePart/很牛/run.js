
//这个东西里面的 王族不要了

const Queue = require("../api/queue").Queue;
const File = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");
const readLine = require("lei-stream").readLine;
const getPage = require("../api/fetch").getPage;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

const baseUrl = "http://hnbang.com/page/"

let getOnePage = async (i) => {
	
	let pageHref = baseUrl + i;
	console.log(pageHref, i);
	
	let html = await getPage(pageHref, true);
    let d = new jsdom.JSDOM(html);
	let $ = jq(d.window);

	let urls = [];

	try{
		let hrefs = d.window.document.querySelectorAll(".excerpt.excerpt-one a")
		for(let h of hrefs){
			File.appendFileSync("很牛列表.txt", h.getAttribute("href") + "\n");
			urls.push(h.getAttribute("href"));
		}
	}catch(e){
		console.log(e);
	}
}

(async () => {
	for(let i = 1;i< 66;i++){
		await getOnePage(i);
		console.log("已经完成",i);
		await sleep(1);
	}
	
})()