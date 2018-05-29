var reject = function () {
    chrome.runtime.sendMessage(false);
}

var keyword = (function () {
    var url = window.location.href;
    url = url.split("=")[1];
    return decodeURIComponent(url)
})()
console.log(keyword);

console.log("已经进入页面了");
setTimeout(function () {
    document.querySelectorAll(".tab-wrapper li")[2].click()
    setTimeout(function () {

        var re = document.querySelectorAll(".account-item-wrapper");
        if (re.length == 0) reject();
        if (re.length == 1){
            if (re[0].querySelector(".key-word").innerText == keyword ) {

                var style = document.querySelectorAll(".account-item-wrapper img")[0].style["background-image"];
                console.log(style)
                style = style.split("=");

                var uin = style[style.length - 2]
                uin = uin.split("&")[0]
                console.log(uin)

                chrome.runtime.sendMessage(uin);
                window.close();
                return;
            }
        }else{
            let sure = []
            for (var i = 0; i < re.length; i++) {
                if (re[i].querySelector(".key-word").innerText == keyword ) {
                    sure.push(i);
                }
            }

            if(sure.length === 1){
                let i = sure[0];
                var style = document.querySelectorAll(".account-item-wrapper img")[i].style["background-image"];
                console.log(style)
                style = style.split("=");

                var uin = style[style.length - 2]
                uin = uin.split("&")[0]
                console.log(uin)

                chrome.runtime.sendMessage(uin);
                window.close();
                return;
            }
        }


        reject();
        window.close();
        return;

    }, 3000)
}, 1000)


