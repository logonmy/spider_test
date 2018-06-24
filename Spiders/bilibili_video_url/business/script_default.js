domExtension(window);
function domExtension(window) {
    var srcUrl;

    if (window.Node.prototype.byId == undefined) {
        window.Node.prototype.byId = function(t, ignoreCheck) {
            var node = window.document.getElementById(t);
            if (node == undefined && ignoreCheck != true) {
                warning(getUrl() + " | byId \"" + t + "\" fail!");
            }
            return node;
        };
    }

    if (window.Node.prototype.byTags == undefined) {
        window.Node.prototype.byTags = function(t, ignoreCheck) {
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
        window.Node.prototype.removeId = function(id) {
            var node = this.byId(id, true);
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeClass == undefined) {
        window.Node.prototype.removeClass = function(c) {
            var node = this.byClass(c, true);
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeClasses == undefined) {
        window.Node.prototype.removeClasses = function(c) {
            var nodes = this.byClasses(c, true);
            while (nodes.length > 0) {
                var node = nodes[0];
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeTag == undefined) {
        window.Node.prototype.removeTag = function(t) {
            var node = this.byTag(t, true);
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
    }

    if (window.Node.prototype.removeTags == undefined) {
        window.Node.prototype.removeTags = function(t) {
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


findVideoAndCoverImg();

var bilibiliTryCount = 0;
function findVideoAndCoverImg() {
    var model = {};

    // 已包含bilibili代码 无需
    // if (window.location.href.indexOf("bilibili") > 0) {
    //     console.log("bilibili here");
    //
    //     bilibiliTryCount = 0;
    //     extractBilibili();
    //
    //     return;
    // }


    var video = document.byTag("video");
    if (!video) {
        var btn = document.byClass("m-btn-media");
        if (btn) {
            btn.click();
            setTimeout(function() {
                findVideoAndCoverImg();
            }, 100);
            return;
        }

        var btn = document.byClass("player-icon");
        if (btn) {
            btn.click();
            setTimeout(function() {
                findVideoAndCoverImg();
            }, 100);
            return;
        }
        var btn = document.byClass("mwbv-play-button");
        if (btn) {
            btn.click();
            setTimeout(function() {
                findVideoAndCoverImg();
            }, 100);
            return;
        }
        console.log(model);
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
        }
    }

    var cover_img = "";
    cover_img = video.attr("poster");

    var videoimg = document.byClass("videoimg");
    if (videoimg) {
        var cover = videoimg.byClass("cover");
        cover_img = extractBackgroundImage(cover);
    }
    var fBgImg = document.byClass("f-bg-img");
    if (fBgImg) {
        cover_img = extractBackgroundImage(fBgImg);
    }

    model.source = src;
    model.cover_img = cover_img;
    console.log(model);
    chrome.runtime.sendMessage(model.source, function (response) {
        window.close();
    });
}

function extractBackgroundImage(node) {
    var src = node.style.backgroundImage;
    if (src.indexOf("url(") == 0) {
        src = src.substring(5, src.length - 2);
    }
    return src;
}