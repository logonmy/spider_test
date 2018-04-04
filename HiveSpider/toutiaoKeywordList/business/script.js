var articleCountCache = 0;
let count = 0;
let sleep = async (s=1) => {
    return new Promise(resolve => {setTimeout(resolve, s * 1000)});
}

var scroll = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 200);
},50)

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
            //rqst.setRequestHeader('Content-type', 'application/json');
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
let httpCall = (path, args) => {
    return new Promise((resolve, reject) => {
        let data = (args) ? JSON.stringify(args) : "";
        liteAjax(path, (data) => {
            console.log(data);
            try {
                let res = JSON.parse(data);
                if (res.err_no !== 0) throw new Error(res.stack.join("\n"));
                return resolve(res.result);
            } catch(err) {
                return reject(err);
            }
        }, "POST", data);
    });
};
const filterItems = async(data) => {
    let query = {
        partition: "toutiao_keyword_detail",
        keys: data.items.map(item => item.url)
    };
    try {
        let res = await httpCall(`http://bee.api.talkmoment.com/dereplicate/filter/by/history`, query);
        data.items = data.items.filter((item, i) => (res.filter_result[i]));
    }catch (e){
        console.log(e)
    }
};


let watchUpdate = async () => {
    let articleCount = document.querySelectorAll(".articleCard").length;

    let data = {items: []};
    let items = document.querySelectorAll(".articleCard");
    for(let i=0;i<items.length;i++){
        let item = {
            url: ""
        }
        item.url = items[i].querySelector(".link.title").getAttribute("href")
        item.url = "https://www.toutiao.com/i" + item.url.split("/")[2] + "/";
        data.items.push(item);
    }
    await filterItems(data);
    let readyLength = data.length;

    if(articleCount === articleCountCache || readyLength >= numItemLimit){
        count += 1;
        console.log(count);

        if(count === 5){
            console.log("clear");
            clearInterval(scroll);
            return ;
        }
    }else{
        count = 0;
    }
    articleCountCache = document.querySelectorAll(".articleCard").length;
    await sleep();
    await watchUpdate();
}

var TemplateData = {
    items: []
}

let run = async () => {
    console.log(window.numItemLimit, "duasdkjusahdjkhasjkdhfjkldhfakhjsdfgkalsg")
    await watchUpdate();
    console.log("页面加载完毕");

    let items = document.querySelectorAll(".articleCard");
    for(let i=0;i<items.length;i++){
        let item = {
            title: "",
            url: "",
            cover_img: {
                src: "",
                width: 0,
                height: 0,
            }
        }
        try{

            item.title = items[i].querySelector(".link.title").innerText;
            console.log(item.title);


            item.url = items[i].querySelector(".link.title").getAttribute("href")
            item.url = "https://www.toutiao.com/i" + item.url.split("/")[2] + "/";

            if(items[i].querySelector(".img-wrap img")){
                let img = items[i].querySelector(".img-wrap img");
                item.cover_img.src = img.getAttribute("src");
                item.cover_img.width = img.naturalWidth;
                item.cover_img.height = img.naturalHeight;
            }

            TemplateData.items.push(item);

        }catch(e){
            console.log(e)
        }
    }
    console.log(TemplateData);
    chrome.runtime.sendMessage(TemplateData, function (response) {});
}
try{
    run();
}catch(e){
    chrome.runtime.sendMessage({
        error:e,
        data: TemplateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}