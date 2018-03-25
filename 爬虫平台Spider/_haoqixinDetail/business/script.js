var BeeUtils = new _BeeUtils();

function _BeeUtils() {

    var self = this;

    this.warning = function (msg) {
        var d = new Date();
        var log = d.toLocaleString() + " | " + msg;
        liteAjax("http://message.api.jndroid.com/publish?topic=bee_weixin_error", function () {
        }, "post", log);
    };

    this.log = function (str) {
        var d = new Date();
        console.log(d.toLocaleString() + " | " + str);
    };

    this.putModel = function (model) {
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
        liteAjax(url, function (e) {
            var eObj = JSON.parse(e);
            result = (eObj.err_no == 0);
            if (result == false) {
                self.warning("putData fail! " + JSON.stringify(eObj));
            }
        }, "post", JSON.stringify(data), false);
        return result;
    }

    this.scrollToBottom = function (document) {
        document.body.scrollTop = document.body.scrollHeight;
    };

    this.hashCode = function (str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    this.formatTime = function (timeString) {
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
            timeString = (new Date()).getFullYear() + "年" + timeString;
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

    this.htmlToJson = function (htmlNode, adTexts, adImgs, imgConverter) {
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
                    } catch (e) {
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
                        image.src = "https:" + node.getAttribute("data-src");
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

var templateData = {
    cover_img: {
        src: "",
        width: 0,
        height: 0
    },
    title: "",
    created_at: 0,
    url: "",
    content: "",
    comments: []
}


setTimeout(function () {
    try {
        var timeCount = 0;
        var index = setInterval(function () {
            window.scrollTo(0, document.documentElement.scrollTop + 200);
            if (document.querySelectorAll(".comment-text").length > 20 || timeCount === 200) {
                clearInterval(index);
                if(document.querySelector(".article-detail-hd img")){
                    var image = document.querySelector(".article-detail-hd img");
                    templateData.title = image.getAttribute("alt");
                    templateData.cover_img.src = image.getAttribute("src");
                    templateData.cover_img.width = image.naturalWidth;
                    templateData.cover_img.height = image.naturalHeight;
                }else{
                    templateData.title = document.querySelector("h2.title").innerText;
                }

                templateData.created_at = new Date(document.querySelector(".date.smart-date").getAttribute("date-origindata")).getTime();
                templateData.url = window.location.href;
                templateData.content = JSON.stringify(BeeUtils.htmlToJson(document.querySelector(".detail")));

                let comments = document.querySelectorAll(".comment-text");

                for(comment of comments){
                    templateData.comments.push(comment)
                }

                chrome.runtime.sendMessage(templateData);
                window.close()
            }
            timeCount++;
        }, 50);
    }


    catch (e) {
        chrome.runtime.sendMessage({
            error: e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {
        });
        window.close();
    }
}, 1000)
