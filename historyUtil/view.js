


const fetch = require("node-fetch");
const File = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");
const http = require("http");
const request = require("request");
const crypto = require("crypto");
const randomUA = require("./randomUA").randomUA;

const md5sum = (data, outputEncoding) => {
    outputEncoding = outputEncoding || "hex";
    return crypto.createHash("md5").update(data).digest(outputEncoding);
};

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const safeFetch = async (url, moreArgs = {}) => {
    try {
        return await fetch(url, moreArgs);
    } catch (e) {
        console.error(e);
    }
};

const getApi = async (url, moreArgs = {}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.json();
    } else {
        throw new Error(`fetch failed,status ${res.status} api: ${url}`);
    }
};

const getPage = async (url, moreArgs = {}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.text();
    } else {
        throw new Error(`fetch failed,status ${res.status} page: ${url}`);
    }
};

const getDynamicIP = async () => {
    console.log("换ip啦！==================================================>>>>>>>>>>>>>");
    await sleep(2);
    let url = "http://webapi.http.zhimacangku.com/getip?num=1&type=2&pro=0&city=0&yys=0&port=1&pack=21331&ts=0&ys=0&cs=0&lb=1&sb=0&pb=45&mr=1&regions=";
    let res = await getApi(url);
    if (res && res.code === 0) {
        return `http://${res.data[0].ip}:${res.data[0].port}`
    } else {
        throw new Error("get dynamic ip failed");
    }
};

const requestSync = (option) => {
    return new Promise((resolve, reject) => {
        request(option, (err, res) => {
            if (err) {
                return reject("request failed");
            }
            return resolve(res.body);
        })
    })
};

let count = 0;

const bee = async (num, proxy) => {
    count++;
    if (count > 50) {
        count = 0;
        let proxyHost = await getDynamicIP();
        await bee(num, proxyHost);
        return;
    }
    // let proxyHost = await getDynamicIP();
    // console.log(proxyHost);
    await sleep(10);
    let htmlStr = "";
    let ua = randomUA();
    try {
        let timeOut = setTimeout(() => {
            process.exit(0)
        }, 30000);
        htmlStr = await requestSync({
            url: `http://www.juzimi.com/ju/${num}`, proxy: proxy,
            headers: {
                "User-Agent": ua
            },
            gzip: true
        })
        ;
        clearTimeout(timeOut);
    } catch (e) {
        console.log(e);
        let proxyHost = await getDynamicIP();
        await bee(num, proxyHost);
        return;
    }
    // if (htmlStr.indexOf("block-block-19") > 0) {
    //     console.log(proxy);
    //     console.log("混淆了");
    //     let proxyHost = await getDynamicIP();
    //     await bee(num, proxyHost);
    //     return;
    // }
    let d = new jsdom.JSDOM(htmlStr);
    let $ = jq(d.window);
    let title = $("title").text();
    if (!title) {
        let proxyHost = await getDynamicIP();
        await bee(num, proxyHost);
        return;
    }
    if (title.indexOf("找不到网页 404") >= 0) {
        console.log(404, num);
        File.writeFileSync("num.txt", num + 1);
        await bee(++num, proxy);
        return;
    }
    File.writeFileSync("/Users/dyp/juzimi/" + num + "xxx.html", htmlStr);
    console.log(title + "\n", num);
    File.writeFileSync("num.txt", num + 1);
    await bee(++num, proxy);
};

bee(parseInt(File.readFileSync("num.txt") + ""));

// function getProxyList() {
//     var apiURL = 'http://www.66ip.cn/mo.php?sxb=&tqsl=100&port=&export=&ktip=&sxa=&submit=%CC%E1++%C8%A1&textarea=http%3A%2F%2Fwww.66ip.cn%2F%3Fsxb%3D%26tqsl%3D100%26ports%255B%255D2%3D%26ktip%3D%26sxa%3D%26radio%3Dradio%26submit%3D%25CC%25E1%2B%2B%25C8%25A1';
//
//     return new Promise((resolve, reject) => {
//         var options = {
//             method: 'GET',
//             url: apiURL,
//             gzip: true,
//             encoding: null,
//             headers: {
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//                 'Accept-Encoding': 'gzip, deflate',
//                 'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
//                 'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
//                 'referer': 'http://www.66ip.cn/'
//             },
//
//         };
//
//         request(options, function (error, response, body) {
//
//
//             try {
//
//                 if (error) throw error;
//
//                 if (/meta.*charset=gb2312/.test(body)) {
//                     body = iconv.decode(body, 'gbk');
//                 }
//
//                 var ret = body.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,4}/g);
//
//
//                 resolve(ret);
//
//             } catch (e) {
//                 return reject(e);
//             }
//
//
//         });
//     })
// }
//
//
// getProxyList().then(function (proxyList) {
//
//     var targetOptions = {
//         method: 'GET',
//         url: 'http://ip.chinaz.com/getip.aspx',
//         timeout: 8000,
//         encoding: null,
//     };
//
//     //这里修改一下，变成你要访问的目标网站
//     proxyList.forEach(function (proxyurl) {
//
//         console.log(`testing ${proxyurl}`);
//
//         targetOptions.proxy = 'http://' + proxyurl;
//         request(targetOptions, function (error, response, body) {
//             try {
//                 if (error) throw error;
//
//
//                 body = body.toString();
//
//                 console.log(body);
//
//                 eval(`var ret = ${body}`);
//
//
//                 if (ret) {
//                     console.log(`验证成功==>> ${ret.address}`);
//                 }
//             } catch (e) {
//                 // console.error(e);
//             }
//
//
//         });
//
//     });
// }).catch(e => {
//     console.log(e);
// })