const iconv = require('iconv-lite');
const request = require('request');
const jsdom = require("jsdom");
const File = require("fs");
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const getPageNum = async (pageNum) => {
	// let href = "http://xuexiao.51sxue.com/slist/?o=&t=6&areaCodeS=&level=&sp=&score=&order=&areaS=%C8%AB%B9%FA&searchKey=&page=" + pageNum;
	let href = "http://xuexiao.51sxue.com/slist/?o=&t=3&areaCodeS=&level=&sp=&score=&order=&areaS=%C8%AB%B9%FA&searchKey=&page=" + pageNum;
	return new Promise((resolve, reject) => {
	 	request.get(href).pipe(iconv.decodeStream('gbk')).collect(function(err, body) {
	        let d = new jsdom.JSDOM(body);
	        let b = [];
	        let document = d.window.document;
	        let as = document.querySelectorAll("h3 a");
	        for(let a of as){
	            b.push(a.getAttribute("href"));
	            File.appendFileSync("zhongxue.txt", a.getAttribute("href") + "\n");
	        }
	        resolve(b);
	    });
	})
}
(async () => {
	for(let i =1038;i<1335;i++){
		console.log(i);
		await getPageNum(i)
		console.log(i,"已完成");
		// await sleep(1);
	}
})()