const File = require("fs");
const jsdom = require("jsdom");
const getPage = require("../api/fetch").getPage;

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

const baseUrl = "http://www.shuoshuokong.com/tupian/index_";

let getOnePage = async (i) => {
    let pageHref = baseUrl + i + ".html";
    if(i == 1){
        pageHref = "http://www.shuoshuokong.com/tupian";
    }

    console.log(pageHref, i);

    let html = await getPage(pageHref, true);
    let d = new jsdom.JSDOM(html);
    let document = d.window.document;

    try{
        if(i <= 34){

            let as = document.querySelectorAll(".g-list-box li a");
            for(let a of as){
                console.log(a.getAttribute("href"));
                File.appendFileSync("list.txt", a.getAttribute("href") + "\n");
            }

        }else{

            let as = document.querySelectorAll(".ymwz dt a");
            for(let a of as){
                console.log(a.getAttribute("href"));
                File.appendFileSync("list.txt", a.getAttribute("href") + "\n");
            }

        }
    }catch(e){
        console.log(e);
    }
}

(async () => {
    for(let i = 0;i< 39;i++){
        await getOnePage(i);
        console.log("已经完成",i);
        await sleep(2);
    }
})()