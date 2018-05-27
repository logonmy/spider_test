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
    }
}
console.log(1)




let getComments = async(uin,feeds_id) => {
    return new Promise((resolve, reject) => {
        liteAjax("http://kandian.qq.com/qz_kandian_social/kandian_ext/GetCommentListV2?uin=" + uin + "&feeds_id=" + feeds_id + "&feedsType=12&startIndex=0&reqCount=20", function(d){
            console.log(d);
            resolve(d)
        })
    })
}

let getLists = async(uin) => {
    return new Promise((resolve, reject) => {
        liteAjax("http://kandian.qq.com/cgi-bin/social/getHomePage?uin=" + uin + "&pageNo=1&pageSize=10", function(d){
            console.log(d);
            resolve(d)
        })
    })
}


let uid = "2363622731";
let feed_ids = "16098934180474418474";
