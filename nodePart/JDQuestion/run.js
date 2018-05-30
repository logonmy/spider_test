// const jq = require("jquery");
// const jsdom = require("jsdom");
// const File = require("fs");
//
// const fetch = require("node-fetch");
// const safeFetch = async (url, moreArgs = {}) => {
//     try {
//         return await fetch(url, moreArgs);
//     } catch (e) {
//         return false;
//         console.error(e);
//     }
// };
//
// const getApi = async (url, moreArgs = {headers: {"Content-Type":"application/json", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36", "Connection": "keep-alive",}}) => {
//     let res = await safeFetch(url, moreArgs);
//     if (res !== undefined && res.status === 200) {
//         return res.json();
//     } else {
//         return false;
//     }
// };
// const getPage = async (url, moreArgs = {}) => {
//     let res = await safeFetch(url, moreArgs);
//     if (res !== undefined && res.status === 200) {
//         return res.text();
//     } else {
//         return false;
//     }
// };

const getApi = require("../api/fetch").getApi;
const Queue = require("../api/queue").Queue;
const File = require("fs");
const getQuestionList = async (id) => {
    let url = "https://question.jd.com/question/getQuestionAnswerList.action?page=1&productId=" + id;
    let data = await getApi(url);
    return data;
}
const getAllAnswer = async (id) => {
    let url = "https://question.jd.com/question/getAnswerListById.action?page=1&questionId=" + id;
    let data = await getApi(url);
    return data;
}
const getId = async() =>{
    let d = await Queue.getDataFromMessage("JDTEST");
    console.log(JSON.parse(d.result).id);
    return JSON.parse(d.result).id
}

(async () => {
    while(true){
        let productId = await getId()
        let ql = await getQuestionList(productId);

        console.log(ql.questionList)
        let result = [];
        for (let q of ql.questionList) {
            let xihua = {
                pId: productId,
                qId: q.id,
                C: q.content,
                R: [],
            }
            for (let a of q.answerList) {
                xihua.R.push(a.content);
            }
            result.push(xihua);
        }
        console.log(result);
        for (let re of result) {
            let d = await getAllAnswer(re.qId);
            for (let a of d.answers) {
                re.R.push(a.content);
            }
        }
        console.log("#############");
        console.log(result);
        for(let re of result){
            File.appendFileSync("jsr.txt", JSON.stringify(re) + "\n");
        }
    }
    // let dat = await getPage("https://search.jd.com/Search?keyword=%E9%9D%A2%E8%86%9C&enc=utf-8&qrst=1&rt=1&stop=1&vt=2&wq=%E9%9D%A2%E8%86%9C&stock=1&page=2&s=1&click=0");
    // let d = new jsdom.JSDOM(dat);
    // let $ = jq(d.window);
    // let s = $(".gl-item");
    // console.log(s.attr("data-sku"));
})()