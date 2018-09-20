const getPage = require("../api/fetch").getPage;
const getApi = require("../api/fetch").getApi;
const jsdom = require("jsdom");
const File = require("fs");


let map = new Map();

const checkUrl = async (url) => {
    let d = await getPage(url);
    for (let m of map) {
        if (url.indexOf(m[0]) > -1) {
            let re = m[1].call(null, url, d);
            return re;
        }
    }
    console.log("unknow")
    return true;
}
const checkTCN = async (url, d) => {
    let getRender_data = (d) => {
        d = d.split("script>");
        let code = "";
        for (let c of d) {
            if (c.indexOf("render_data") > -1) {
                code = c.substr(0, c.length - 2);
                break;
            }
        }
        if (!code)
            return null;
        else {
            eval(code)
            return $render_data;
        }
    }
    d = d.split("\n");
    for (let h of d) {
        if (h.indexOf("var url =") > -1 && h.indexOf("weibo") > -1) {
            eval(h);
            trueUrl = url
            break;

        }
    }
    let mUrl = url.split("?")[0].split("/");
    mUrl = mUrl[mUrl.length - 1];
    url = "https://m.weibo.cn/status/" + mUrl;
    d = await getPage(url);
    d = getRender_data(d);
    if (d.status && d.status.page_info && d.status.page_info.type == "video") {
        return true;
    }
    return false;
}
const checkMWeibo = async (url, d) => {
    let getRender_data = (d) => {
        d = d.split("script>");
        let code = "";
        for (let c of d) {
            if (c.indexOf("render_data") > -1) {
                code = c.substr(0, c.length - 2);
                break;
            }
        }
        if (!code)
            return null;
        else {
            eval(code)
            return $render_data;
        }
    }
    d = getRender_data(d);
    if (d.status && d.status.page_info && d.status.page_info.type == "video") {
        return true;
    }
    return false;
}
const checkBilibili = async (url, d) => {
    d = new jsdom.JSDOM(d);
    let document = d.window.document;
    let error = document.querySelector(".error-body");
    if (!error) {
        return true;
    }
    return false;
}
const checkPear = async (url, d) => {
    d = new jsdom.JSDOM(d);
    let document = d.window.document;
    let error = document.querySelector(".error-main");
    if (!error) {
        return true;
    }
    return false;
}
const checkMiaopai = async (url, d) => {
    d = new jsdom.JSDOM(d);
    let document = d.window.document;
    let error = document.querySelector(".cate_video");
    if (!error) {
        return true;
    }
    return false;
}

const init = async () => {
    map.set("bilibili", checkBilibili);
    map.set("t.cn", checkTCN);
    map.set("pearvideo", checkPear);
    map.set("m.weibo", checkMWeibo);
    map.set("miaopai", checkMiaopai);
    map.set("video.weibo", checkTCN);
}
(async () => {

    await init();

    let href = "http://video.weibo.com/show?fid=1034:4274400573464948";
    console.log(href, "链接")
    let re;
    try {
        re = await checkUrl(href);
    } catch (e) {
        console.log(e)
        re = false;
    }
    console.log(re, "结果");
})()

