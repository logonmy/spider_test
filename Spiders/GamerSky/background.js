require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","config", "../service/tab"], function(fileControll, config, Tab) {
    var BeeUtils = new _BeeUtils();
    function _BeeUtils() {

        var self = this;

        this.warning = function(msg) {
            var d = new Date();
            var log = d.toLocaleString() + " | " + msg;
            liteAjax("http://message.api.jndroid.com/publish?topic=bee_weixin_error", function() {
            }, "post", log);
        };

        this.log = function(str) {
            var d = new Date();
            console.log(d.toLocaleString() + " | "  + str);
        };

        this.putModel = function(model) {
            var data = {};
            if (Utils.isArray(model)) {
                data.data = model;
            } else {
                var models = [];
                models.push(model);
                data.data = models;
            }
            return putData(data);
        };

        function putData(data) {
            var url = "http://message.api.jndroid.com/publish?topic=bee_weixin_output_content";
            var result = false;
            liteAjax(url, function(e) {
                var eObj = JSON.parse(e);
                result = (eObj.err_no == 0);
                if (result == false) {
                    self.warning("putData fail! " + JSON.stringify(eObj));
                }
            }, "post", JSON.stringify(data), false);
            return result;
        }

        this.scrollToBottom = function(document) {
            document.body.scrollTop = document.body.scrollHeight;
        };

        this.hashCode = function(str){
            var hash = 0;
            if (str.length == 0) return hash;
            for (i = 0; i < str.length; i++) {
                char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        };

        this.formatTime = function(timeString) {
            if (!timeString) {
                console.log("Error:" + timeString);
                return;
            }
            timeString = timeString.trim();
            if (timeString.indexOf("今天") == 0) {
                var d = new Date();
                timeString = d.toLocaleDateString() + " " + timeString.substring(2);
            } else if (timeString.indexOf("昨天") == 0) {
                var now = new Date();
                var d = new Date(now.getTime() - 1000 * 60 * 60 * 24);
                timeString = d.toLocaleDateString() + " " + timeString.substring(2);
            }
            if (timeString.indexOf("日") > 0 && timeString.indexOf("月") > 0 && timeString.indexOf("年") < 0) {
                timeString = (new Date()).getFullYear() + "年" +timeString;
            }
            if (timeString.indexOf("日") > 0) {
                var timeFrames = timeString.split("日");
                timeFrames[0] = timeFrames[0].replace("年", "-");
                timeFrames[0] = timeFrames[0].replace("月", "-");
                timeString = timeFrames[0].trim() + " " + timeFrames[1].trim();
            }

            var colonCount = timeString.split(":").length - 1;
            var now = new Date();
            if (colonCount == 1) {
                var sec = Math.floor(Math.random() * 59);
                timeString += ":" + sec;
            } else if (colonCount == 0) {
                var h = Math.floor(Math.random() * now.getHours());
                var m = Math.floor(Math.random() * now.getMinutes());
                var s = Math.floor(Math.random() * now.getSeconds());
                timeString += " " + h + ":" + m + ":" + s;
            }
            timeString = timeString.replace(/-/g, "/");
            var slashCount = timeString.split("/").length - 1;
            if (slashCount == 0) {
                timeString = now.toLocaleDateString() + " " + timeString;
            }
            console.log("format time:" + timeString);
            d = new Date(timeString);
            if (d != "Invalid Date" && d.getTime() <= now.getTime()) {
                return d;
            } else {
                console.log("Error:" + timeString);
                return new Date();
            }
        };

        this.htmlToJson = function(htmlNode, adTexts, adImgs, imgConverter) {
            // 测试文章：
            // 果壳网：http://www.guokr.com/article/440982/
            // 打喷嚏：http://www.dapenti.com/blog/more.asp?name=xilei&id=106454

            var jsonResult = [];
            var result = "";

            recursiveFormat(htmlNode);

            contentListToJson();

            return jsonResult;

            function contentListToJson() {
                var frames = result.split("%%%%");
                for (var i = 0; i < frames.length; i++) {
                    var frame = frames[i];
                    if (frame.trim() == "") {
                        continue;
                    }
                    if (isNaN(frame) == false) {
                        var p = {};
                        p.p = frame;
                        jsonResult.push(p);
                    } else {
                        try {
                            var obj = JSON.parse(frame);
                            jsonResult.push(obj);
                        } catch(e) {
                            var p = {};
                            p.p = frame;
                            jsonResult.push(p);
                        }
                    }
                }
            }

            function recursiveFormat(htmlnode) {
                var length = htmlnode.childNodes.length;

                for (var i = 0; i < length; i++) {
                    var node = htmlnode.childNodes[i];
                    if (isNewLineTag(node.nodeName.toLowerCase())) {
                        if (node.style.display != "none") {
                            recursiveFormat(node);
                        }

                        result += "%%%%";
                    } else if (node.nodeName == "#text") {
                        if (node.nodeValue.trim() == "") {
                            continue;
                        }
                        var value = node.nodeValue.trim();
                        result += value;
                    } else if (node.nodeName.toLowerCase() == "img") {
                        var image = {};
                        if (imgConverter) {
                            image = imgConverter.call(this, node);
                            if (image == null || image == undefined) {
                                continue;
                            }
                        } else {
                            image.src = node.src;
                            image.width = node.clientWidth;
                            image.height = node.clientHeight;
                        }
                        if (image.src.indexOf("http") != 0) {
                            continue;
                        }
                        var img = {};
                        img.img = image;
                        result += "%%%%" + JSON.stringify(img) + "%%%%";
                    } else if (node.nodeName.toLowerCase() == "iframe") {
                        var iframe = {};
                        iframe.src = node.src;
                        iframe.width = node.width;
                        iframe.height = node.height;
                        var iframeNode = {};
                        iframeNode.iframe = iframe;
                        result += "%%%%" + JSON.stringify(iframeNode) + "%%%%";
                    } else if (node.nodeName.toLowerCase() == "video") {
                        var video = {};
                        video.src = node.src;
                        video.width = node.clientWidth;
                        video.height = node.clientHeight;
                        var videoNode = {};
                        videoNode.video = video;
                        result += "%%%%" + JSON.stringify(videoNode) + "%%%%";
                    } else {
                        if (node.nodeName != "#comment" && node.nodeName.toLowerCase() != "script" && node.nodeName.toLowerCase() != "style"
                            && node.nodeName.toLowerCase() != "noscript" && node.style.visibility != "hidden" && node.style.display != "none") {
                            recursiveFormat(node);
                        }
                    }
                }
            }

            function isNewLineTag(tag) {
                var newLineTags = ["br", "p", "div", "section", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul"];
                for (var i = 0; i < newLineTags.length; i++) {
                    if (tag == newLineTags[i]) {
                        return true;
                    }
                }
                return false;
            }

            function isAdText(text) {
                if (adTexts) {
                    for (var i = 0; i < adTexts.length; i++) {
                        if (Utils.isArray(adTexts[i])) {
                            var match = true;
                            for (var j = 0; j < adTexts[i].length; j++) {
                                var word = adTexts[i][j];
                                if (text.indexOf(word) < 0) {
                                    match = false;
                                }
                            }
                            if (match) {
                                return true;
                            }
                        } else {
                            if (text.indexOf(adTexts[i]) >= 0) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }

            function isAdImg(src) {
                if (adImgs) {
                    for (var i = 0; i < adImgs.length; i++) {
                        if (adImgs[i] == src) {
                            return true;
                        }
                    }
                }
                return false;
            }
        };

    }

    String.prototype.replaceAll = function(searchValue, replaceValue) {
        return this.replace(new RegExp(searchValue,"gm"), replaceValue);
    };

    var stop = parseInt(localStorage.getItem(config.storageStopName)) || 0;
    var sourcePromise = fileControll.read(config.sourceFileName);
    var toCrawl = [];
    var crawlCount;
    sourcePromise.then(function (data) {
        data = data + '';
        data = data.substr(1,data.length-2);
        data = data.split('""');
        for(var i = 0; i < data.length; i++){
            toCrawl.push(data[i]);
        }

        if(stop){
            crawlCount = stop;
            start();
        }else{
            localStorage.setItem(config.storageStopName, 0);
            crawlCount = 0;
            var promise = fileControll.init(config.fileName);
            promise.then(function(data){
                start();
            }, function(error){

            })
        }

        function start(){
            liteAjax(toCrawl[crawlCount], function(d){
                var html = document.createElement("html");
                html.innerHTML = d;
                var TemplateData = {
                    C: "",
                    R: {
                        title: "",
                        article: [],
                        comments: [],
                    },
                    created_at: ""
                }

                console.log(toCrawl[crawlCount]);
                if(html.querySelector("[id=redirectTips]")){
                    //短讯
                    console.log("是短讯");

                    function parseComment(str){
                        var tempArray = str.split(":");
                        var tempStr;
                        for(var i = 1; i < str.length; i++){
                            tempStr += tempArray[i];
                        }
                        return tempStr;
                    }

                    window.hh = html;
                    var shortUrl = html.querySelector("[id=redirectTips]").getAttribute("data-link");
                    liteAjax(shortUrl, function(d){
                        html.innerHTML = d;
                        TemplateData.R.title = html.querySelector("title").textContent.split("_")[0];
                        TemplateData.created_at = new Date(html.querySelector(".user-time a").text).getTime();
                        TemplateData.R.article.push(BeeUtils.htmlToJson(html.querySelector(".qzcmt-content")));

                        if(html.querySelector(".reply-msg")){
                            for(var i = 0; i < html.querySelector(".reply-msg .reply-txt").length; i++){
                                TemplateData.R.comments.push(parseComment(html.querySelector(".reply-msg .reply-txt")[i].textContent));
                            }
                        }

                        window.hh = html
                        console.log(html);
                    })
                }else{
                    //文章
                    console.log("是文章")
                    window.hh = html;
                    console.log(html)

                    TemplateData.R.title = html.querySelector(".Mid2L_tit h1").textContent;
                    TemplateData.created_at = new Date(html.querySelector(".Mid2L_tit .detail").textContent.split("来源")[0].trim()).getTime();

                    //comments
                    var comments = {
                        articleId: 0,
                        getComments: function(){
                            var self = this;
                            self.articleId = toCrawl[crawlCount].split(".")[2].split("/")[3];
                            var url = "http://cm.gamersky.com/api/getnewestcomment2?jsondata=%7B%22pageIndex%22%3A1%2C%22pageSize%22%3A10%2C%22articleId%22%3A%22" + self.articleId + "%22%2C%22isHot%22%3Atrue%7D";

                            liteAjax(url, function(d){
                                html.innerHTML += d;
                                console.log("newesthtml",html)
                                window.hhh = html;
                                url = "http://cm.gamersky.com/api/gethotcomment2?jsondata=%7B%22pageIndex%22%3A1%2C%22pageSize%22%3A10%2C%22articleId%22%3A%22" + self.articleId + "%22%2C%22isHot%22%3Atrue%7D";
                                liteAjax(url, function(d){
                                    html.innerHTML += d;
                                    console.log("hothtml",html)
                                    window.hhhh = html
                                    for(var i = 0; i < html.querySelectorAll(".warp-build"); i++){
                                        html.querySelectorAll(".wrap-build")[i].remove();
                                    }
                                    for(var i = 0; i < html.querySelectorAll(".warp-issue"); i++){
                                        TemplateData.R.comments.push(html.querySelectorAll(".wrap-issue")[i]);
                                    }
                                })

                            })
                        }
                    }

                    //article
                    function remove(str){
                        if(html.querySelector(str)){
                            html.querySelector(str).remove();
                        }
                    }

                    var article = {
                        page: 0,
                        getArticle: function(){
                            var self = this;
                            if(html.querySelector(".Mid2L_con")){
                                //页面存在
                                html.querySelector(".pagecss").remove();
                                remove(".pagecss");
                                remove(".gs_ccs_solve");
                                remove(".gs_nc_editor");
                                remove(".post_ding.mid.padding_top_20");
                                TemplateData.R.article.push(BeeUtils.htmlToJson(html.querySelector(".Mid2L_con")));

                                if(document.querySelector(".page_css")){
                                    liteAjax(self.parseUrl(), function(d){
                                        html.innerHTML = d;
                                        self.getArticle();
                                        self.page += 1;
                                    })
                                }
                                if(self.page === 0){
                                    comments.getComments();
                                }
                            }
                            return;
                        },
                        parseUrl: function(){
                            if(page === 0){
                                return toCrawl[crawlCount];
                            }
                            var cut = toCrawl[crawlCount].split("."),
                                temp = '';
                            cut[2] = cut + "_" + page;
                            for(var i = 0; i < cut.length; i++){
                                temp += cut[i];
                            }
                            console.log(temp)
                            return temp;
                        }
                    }

                    article.getArticle();

                }

                console.log(TemplateData);
                crawlCount += 1;
                localStorage.setItem(config.storageStopName, crawlCount)
            }, "GET")
        }

    }, function(){
        console.log("源文件读取失败");
    })
});