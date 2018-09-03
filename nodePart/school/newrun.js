const iconv = require('iconv-lite');
const request = require('request');
const jsdom = require("jsdom");
const File = require("fs");
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const Http = require("../api/http").Http;
const getPage = require("../api/fetch").getPage;

const getPageNum = async (pageNum) => {
	let href = "http://college.gaokao.com/schlist/p" + pageNum;
	console.log(href)
	return new Promise((resolve, reject) => {
	 	request.get(href).pipe(iconv.decodeStream('gbk')).collect(function(err, body) {
	 		console.log(body)
	        let d = new jsdom.JSDOM(body);
	        let b = {};
	        let document = d.window.document;
	        let dls = document.querySelectorAll(".scores_List dl")
	        console.log(dls)
	        for(let dl of dls){

	        	console.log(dl.querySelector("img").getAttribute("src"));
	        	console.log(dl.querySelector("strong").getAttribute("title"));
	        }
	        resolve(b);
	    });
	})
}
(async () => {
	// for(let i =1;i<2;i++){
	// 	console.log(i);
	// 	await getPageNum(i)
	// 	console.log(i,"已完成");
	// 	// await sleep(1);
	// }

	let re = await Http.GBKGet("http://college.gaokao.com/schlist/p1")
	console.log(re);
})()