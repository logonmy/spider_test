let getPageCount = (str) => {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        if (parseInt(str[i])) {
            result += str[i];
        }
    }
    return parseInt(result);
}
var a ="共 23 页";

getPageCount(a)

let  hrefToJson = (str) => {
    let json = {};
    let arr = str.split("?")[1].split("&");
    for(let part of arr){
        json[part.split("=")[0]] = part.split("=")[1];
    }
    return json;
}
var a = "https://weibo.com/u/2718604160?profile_ftype=1&is_ori=1#_0"
console.log(hrefToJson(a))

let findInHref = (key, str) => {
    let  hrefToJson = (str) => {
        let json = {};
        let arr = str.split("?")[1].split("&");
        for(let part of arr){
            json[part.split("=")[0]] = part.split("=")[1];
        }
        return json;
    }
    let json = hrefToJson(str);
    for(let keyWord in json){
        if(keyWord === key){
            return json[keyWord];
        }
    }
    return null;
}

var a = "https://weibo.com/u/2718604160?profile_ftype=1&is_ori=1#_0";
var b = "is_ori";

findInHref(b, a)

let arrayDulicate = (arr) => {
    let checkIn = (str, arr) => {
        for(let a of arr){
            if(str === a){
                return true;
            }
        }
        return false;
    }
    let result = [];

    for(let a of arr){
        if(!checkIn(a,result)){
            result.push(a);
        }
    }
    return result;
}

var a =["a","b","c", "d","e","a","b","c", "d","e"]
console.log(arrayDulicate(a))

function liteAjax(url, callback, method, postBody, aSync) {
    if (method == undefined) {
        method = "GET";
    } else {
        method = method.toUpperCase();
    }
    var aSync = true;
    var headers = {};
    var timeout = false;
    var timer = -1;

    var rqst = getRequestObj();
    if (rqst) {
        rqst.onreadystatechange = function() {
            if (rqst.readyState == 4) {
                if (timeout) {
                    return;
                }
                clearTimeout(timer);
                callback(rqst.responseText);
            }

        };

        rqst.ontimeout = function() {
            if (moreArgs && moreArgs.ontimeout) {
                moreArgs.ontimeout();
            }
            console.log('timeout');
        };
        rqst.onerror = function() {
            if (moreArgs && moreArgs.onerror) {
                moreArgs.onerror();
            }
            console.log('error');
        };
        rqst.onabort = function() {
            if (moreArgs && moreArgs.onabort) {
                moreArgs.onabort();
            }
            console.log('abort')
        };

        rqst.open(method, url, aSync);
        for (key in headers) {
            rqst.setRequestHeader(key, headers[key]);
        }

        if (method == "POST") {
            //rqst.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            rqst.setRequestHeader('Content-type', 'application/json');
        }
        rqst.send(postBody);
    }

    function getRequestObj() {
        if (window.ActiveXObject) {
            return new ActiveXObject('Microsoft.XMLHTTP');
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }}
var sendTaskUrl = "http://bee.api.talkmoment.com/scheduler/task/post";
var postData = {
    name: "pear_index_update",
    value: "",
    config: "{}",
    scheduled_at: new Date().getTime()
}
liteAjax(sendTaskUrl, function(data){
    console.log(data)
}, "POST", JSON.stringify(postData))
