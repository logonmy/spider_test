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
const readLine =require("lei-stream").readLine;


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

let run = async(data) => {
    let product = data;
    try{
        let ql = await getQuestionList(product.id);
        let result = [];
        for (let q of ql.questionList) {
            let xihua = {
                qId: q.id,
                C: q.content,
                R: [],
            }
            for (let a of q.answerList) {
                xihua.R.push(a.content);
            }
            result.push(xihua);
        }
        for (let re of result) {
            let d = await getAllAnswer(re.qId);
            for (let a of d.answers) {
                re.R.push(a.content);
            }
        }
        console.log("#############");
        product.content = result;
        File.appendFileSync("jsr.txt", JSON.stringify(product) + "\n");
    }
    catch(e){
        await sleep(10);
        console.log("whatever");
    }
}
let stop = 70291;
let jumpCount = 0;
readLine("jdtest3333.txt").go(async (data, next) => {
    data = JSON.parse(data);
    data = JSON.parse(data.data);
    console.log(data);
    // let timeout = setTimeout(function(){
    //     stop++;
    //     console.log(stop);
    //     console.log("跳过了一个商品");
    //     console.log(jumpCount++);
    //     next();
    // }, 5000);
    await run(data);
    //clearTimeout(timeout);
    stop++;
    console.log(stop);
    next();
})

