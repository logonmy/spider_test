define([], () => {
    let Http = {};

    Http.request = (url, method, postBody) => {
        return new Promise((resolve, reject) => {
            ajax(url, method, postBody, {}, true, (data, state) => {
                if (state === 4) return resolve(data)
            }, () => {
                return reject(new Error("request timeout!"));
            }, () => {
                return reject(new Error("request error!"));
            }, () => {
                return reject(new Error("request abort!"));
            });
        });
    };

    Http.call = async(path, args) => {
        let reqData = (args) ? JSON.stringify(args) : "";
        let resData = await Http.request(path, "POST", reqData);
        let res = JSON.parse(resData);
        if (res.err_no !== 0) throw new Error(res.stack.join("\n"));
        return res.result;
    };

    function ajax(url, method, postBody, headers, aSync, dataCallback, timeoutCallback, errorCallback, abortCallback) {
        if (method === undefined) {
            method = "GET";
        } else {
            method = method.toUpperCase();
        }
        if (!aSync) {
            aSync = true;
        }
        if (!headers) {
            headers = {};
        }

        let rqst = getRequestObj();
        if (rqst) {
            rqst.onreadystatechange = function() {
                if (rqst.readyState === 3 || rqst.readyState === 4) {
                    if (dataCallback) {
                        dataCallback(rqst.responseText, rqst.readyState);
                    }
                }
            };
            rqst.ontimeout = function() {
                if (timeoutCallback) {
                    timeoutCallback();
                }
            };
            rqst.onerror = function() {
                if (errorCallback) {
                    errorCallback();
                }
            };
            rqst.onabort = function() {
                if (abortCallback) {
                    abortCallback();
                }
            };

            rqst.open(method, url, aSync);
            for (key in headers) {
                rqst.setRequestHeader(key, headers[key]);
            }

            if (method === "POST") {
                //rqst.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                rqst.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
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

    return Http;
});