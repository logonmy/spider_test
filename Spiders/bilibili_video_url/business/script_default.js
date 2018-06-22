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

    chrome.runtime.sendMessage(model, function (response) {
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

// var inter;
// function extractBilibili() {
//     inter = setInterval(function(){
//         try {
//             document.querySelector(".load-layer").click();
//             var href = document.querySelector("source").getAttribute("src");
//             if (href) { } else return;
//             href = "https:" + href;
//             chrome.runtime.sendMessage({source:href});
//             clearInterval(inter);
//             window.close();
//         } catch(e){
//             console.log(e);
//             chrome.runtime.sendMessage({source: ""});
//             clearInterval(inter);
//             window.close();
//         }
//         console.log("interval 了一次")
//     }, 200);
// }