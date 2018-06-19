function changeHeaders(modified, headers, url) {
    for (var i in modified) {
        var add = true;
        for (var j in headers) {
            if (headers[j].name == i) {
                headers[j].value = modified[i];
                add = !add;
            }
        }
        if (add) {
            headers.push({
                name: i,
                value: modified[i]
            })
        }
    }
    return {
        requestHeaders: headers
    }
}

chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    let headers = details.requestHeaders;
    let url = details.url;
    console.log("确实", url);
    let modified = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T)" +
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Mobile" +
        "Safari/537.36",
        //"User-Agent": "bili-universal/6790 CFNetwork/901.1 Darwin/17.6.0",
        "Referer": url,
        "X-Forwarded-for": "127.0.0.1",
        "Cookie":""
    };
    changeHeaders(modified, headers, url);

    return {
        requestHeaders: headers
    };
}, {
    urls: ["*://m.bilibili.com/*"]
}, ["requestHeaders", "blocking"]);