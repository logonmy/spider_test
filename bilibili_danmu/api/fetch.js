const fetch = require("node-fetch");
const safeFetch = async (url, moreArgs = {}) => {
    try {
        return await fetch(url, moreArgs);
    } catch (e) {
        console.error(e);
    }
};

const getApi = async (url, moreArgs = {
    headers: {
        "Origin": "https://www.bilibili.com",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"
    }
}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.text()
    } else {
        return false;
    }
};

const getPage = async (url, moreArgs = {}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.text();
    } else {
        return false;
    }
};

exports.getApi = getApi;
exports.getPage = getPage;