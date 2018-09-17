process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;
const getPage = require("../api/fetch").getPage;
const jsdom = require("jsdom");
const Http = require("../api/http").Http;
const getJoined = require("../../../陶崔晨黑屁股/ghost2/ipa/user").getJoined;
const getGroupInfo = require("../../../陶崔晨黑屁股/ghost2/ipa/compute").getGroupInfo;
const File = require("fs");

const getSrc = async (pingyin) => {
    let href = "http://www.soutu123.com/back/" + pingyin + "-20-0-2-0-0-0-3-1/"
    let html = await getPage(href);
    let d = new jsdom.JSDOM(html);
    let document = d.window.document;
    let src = document.querySelector(".result .img-part img").getAttribute("src")
    return src;
}

const upDateHead = async (groupId, src) => {
    console.log(groupId, src)
    let re = await Http.call("http://chatbot.api.talkmoment.com/group/avatar/put", {
        group: groupId,
        avatar: src
    })
    return re;
}

// let getUnicode = (function () {
//     let pad = function (number, length, pos) {
//         var str = "" + number;
//         while (str.length < length) {
//             //向右边补0
//             if ("r" == pos) {
//                 str = str + "0";
//             } else {
//                 str = "0" + str;
//             }
//         }
//         return str;
//     }
//     let toHex = function (chr, padLen) {
//         if (null == padLen) {
//             padLen = 2;
//         }
//         return pad(chr.toString(16), padLen);
//     }
//     return function (text) {
//         var unicode = new Buffer(text, 'uCS2');
//         var unicodeHex = "";
//         for (var i = 0; i < unicode.length; i = i + 2) {
//             unicodeHex += toHex(unicode[i]) + toHex(unicode[i + 1]);
//         }
//         return unicodeHex;
//     }
// })();

const getPingyin = async (text) => {
    let href = "http://www.soutu123.com/?m=Search&a=check&kw=" + encodeURIComponent(text) + "&search_type=3"
    let res = await Http.get(href);
    res = JSON.parse(res).py;
    return res;
}

const getBaikeSrc = async (text) => {
    let href = "https://baike.baidu.com/item/" + encodeURIComponent(text);
    let html = await getPage(href)
    let d = new jsdom.JSDOM(html);
    let document = d.window.document;
    let src = document.querySelector(".summary-pic img").getAttribute("src")
    return src
}

const run = async (groupId, text) => {
    try {
        // let py = await getPingyin(text)
        // let src = await getSrc(py)
        let src = await getBaikeSrc(text);
        await upDateHead(groupId, src);
        console.log("修改了      ", text)
        File.appendFileSync("modify.txt", text + "\n");
    } catch (e) {
        console.log(e);
    }
}

(async () => {
    let resolved = new Set();
    for (let i = 6000; i < 10000; i++) {
        let ghostId = i;
        console.log("#####################" + i + "####################")
        try {
            let groups = await getJoined(ghostId);
            for (let groupId of groups) {
                if (!resolved.has(groupId)) {
                    console.log(groupId);
                    let s = await getGroupInfo(groupId);
                    if (!s.host && s.avatar == "http://image.jndroid.com/legoman/avatar/default_avatar.png") {
                        await run(groupId, s.name);
                    }
                    resolved.add(groupId)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
})()