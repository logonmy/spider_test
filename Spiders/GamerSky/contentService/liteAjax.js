    /**
     * Created by cqcpcqp on 2018/1/30.
     */
    function liteAjax(url, callback, method, postBody, aSync) {
        if (method == undefined) {
            method = "GET";
        } else {
            method = method.toUpperCase();
        }
        var aSync = true;
        var headers = {
        };
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