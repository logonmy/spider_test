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
        "Content-Type":"application/json"
    }
}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.json();
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