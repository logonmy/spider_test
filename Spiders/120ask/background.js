
require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});

require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../service/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, FileControll) => {
    let lists = [];
    let urls = [];

    let pageCount = 0;
    for(let config of Config){
        lists.push(config.url)
    }

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

    let init = async () => {
        var datas = await FileControll.read("120askUrl");
        urls = datas.split("\n")
    }


    let run = async () => {

        liteAjax(lists[pageCount], function (d) {
            let html = document.createElement('html');
            html.innerHTML = d;

            let a = html.querySelectorAll(".h-ul3 li a");
            for(let b of a){
                let href = b.getAttribute("href")
                if(href.indexOf("http") > -1){
                    console.log(href);
                    FileControll.append("120askUrl", href + "\n");
                }

            }
        }, "GET")

        await Async.sleep(4000)
        pageCount ++ ;
        console.log(pageCount);

        await run();
    };

    let run2 = async () => {
        await init();
        liteAjax(urls[pageCount], function (d) {
            let html = document.createElement('html');
            html.innerHTML = d;

            var title = html.querySelector("#d_askH1").innerText;
            console.log(title);

            pageCount ++ ;
            console.log(pageCount);

            run2();

        }, "GET")

    }

    //run()
    run2()
});
