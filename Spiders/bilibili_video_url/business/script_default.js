domExtension(window);

function domExtension(window) {
    var srcUrl;

    if (window.Node.prototype.byId == undefined) {
        window.Node.prototype.byId = function (t, ignoreCheck) {
            var node = window.document.getElementById(t);
            if (node == undefined && ignoreCheck != true) {
                warning(getUrl() + " | byId \"" + t + "\" fail!");
            }
            return node;
        };
    }

    if (window.Node.prototype.byTags == undefined) {
        window.Node.prototype.byTags = function (t, ignoreCheck) {
            var nodes = this.getElementsByTagName(t);
            if (nodes.length == 0 && ignoreCheck != true) {
                warning(getUrl() + " | byTags \"" + t + "\" empty!");
            }
            return nodes;
        };
    }

    if (window.Node.prototype.byTag == undefined) {
        window.Node.prototype.byTag = function (t, ignoreCheck) {
            var node = this.getElementsByTagName(t)[0];
            if (node == undefined && ignoreCheck != true) {
                warning(getUrl() + " | byTag \"" + t + "\" fail!");
            }
            return node;
        };
    }

    if (window.Node.prototype.byClasses == undefined) {
        window.Node.prototype.byClasses = function (c, ignoreCheck) {
            var nodes = this.getElementsByClassName(c);
            if (nodes.length == 0 && ignoreCheck != true) {
                warning(getUrl() + " | byClasses \"" + c + "\" empty!");
            }
            return nodes;
        };
    }

    if (window.Node.prototype.byClass == undefined) {
        window.Node.prototype.byClass = function (c, ignoreCheck) {
            var node = this.getElementsByClassName(c)[0];
            if (node == undefined && ignoreCheck != true) {
                warning(getUrl() + " | byClass \"" + c + "\" fail!");
            }
            return node;
        };
    }

    if (window.Node.prototype.attr == undefined) {
        window.Node.prototype.attr = function (a, ignoreCheck) {
            var node = this.getAttribute(a);
            if (node == undefined && ignoreCheck == true) {
                warning(getUrl() + " | attr \"" + a + "\" fail!");
            }
            return node;
        };
    }

    if (window.Node.prototype.removeId == undefined) {
        window.Node.prototype.removeId = function (id) {
            var node = this.byId(id, true);
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeClass == undefined) {
        window.Node.prototype.removeClass = function (c) {
            var node = this.byClass(c, true);
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeClasses == undefined) {
        window.Node.prototype.removeClasses = function (c) {
            var nodes = this.byClasses(c, true);
            while (nodes.length > 0) {
                var node = nodes[0];
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeTag == undefined) {
        window.Node.prototype.removeTag = function (t) {
            var node = this.byTag(t, true);
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeTags == undefined) {
        window.Node.prototype.removeTags = function (t) {
            var nodes = this.byTags(t, true);
            while (nodes.length > 0) {
                var node = nodes[0];
                node.parentNode.removeChild(node);
            }
        }
    }

    function warning(s) {
        console.log(s);
    }

    function getUrl() {
        if (srcUrl) {
            return srcUrl;
        }
        //return self.getFrame().contentWindow.location.href;
    }
}

let inter = setInterval(function () {
    try {
        if (document.querySelector("h1").innerText == "414 Request-URI Too Large") {
            //todo
            console.log("过长的URL 无法处理 提取失败");
            clearInterval(inter);
            chrome.runtime.sendMessage("");
            window.close();
        }
    } catch (e) {
        console.log(e);
    }
    try {
        if (document.querySelector("em.S_link1").innerText == "抱歉，网络繁忙") {
            console.log("可能是短链接 网络繁忙 无法处理 提取失败");
            clearInterval(inter);
            chrome.runtime.sendMessage("");
            window.close();
        }
    } catch (e) {
        console.log(e)
    }
    try {
        if (document.querySelector("p.h5-4con").innerText == "抱歉，网络繁忙") {
            console.log("微博不存在或无查看权限");
            clearInterval(inter);
            chrome.runtime.sendMessage("");
            window.close();
        }
    } catch (e) {

    }
    findVideoAndCoverImg();
}, 200);


function findVideoAndCoverImg() {
    var model = {};

    var video = document.byTag("video");
    if (!video) {
        var btn = document.byClass("m-btn-media");
        if (btn) {
            btn.click();
            setTimeout(function () {
                findVideoAndCoverImg();
            }, 100);
            return;
        }

        var btn = document.byClass("player-icon");
        if (btn) {
            btn.click();
            setTimeout(function () {
                findVideoAndCoverImg();
            }, 100);
            return;
        }
        var btn = document.byClass("mwbv-play-button");
        if (btn) {
            btn.click();
            console.log("click mwbv-play-button");
            setTimeout(function () {
                findVideoAndCoverImg();
            }, 100);
            return;
        }
        console.log(model, "这就是最后的结果0000000000");
        chrome.runtime.sendMessage(model.source, function (response) {
            window.close();
        });
        return;
    }

    video.currentTime = 200;

    var src = video.src;
    if (src == "") {
        var source = video.childNodes[0];
        if (source) {
            src = source.src;
        }else{
            var btn = document.byClass("m-btn-media");
            if (btn) {
                btn.click();
                setTimeout(function () {
                    findVideoAndCoverImg();
                }, 100);
                return;
            }
    
            var btn = document.byClass("player-icon");
            if (btn) {
                btn.click();
                setTimeout(function () {
                    findVideoAndCoverImg();
                }, 100);
                return;
            }
            var btn = document.byClass("mwbv-play-button");
            if (btn) {
                btn.click();
                console.log("click mwbv-play-button");
                setTimeout(function () {
                    findVideoAndCoverImg();
                }, 100);
                return;
            }
            console.log(model, "这就是最后的结果0000000000");
            chrome.runtime.sendMessage(model.source, function (response) {
                window.close();
            });
            return;
        }
    }

    model.source = src;
    console.log(model, "这就是最后的结果11111111");
    chrome.runtime.sendMessage(model.source, function (response) {
        window.close();
    });
}