

console.log("已经进入页面了");
setTimeout(function () {
    document.querySelectorAll(".tab-wrapper li")[2].click()
    setTimeout(function(){
        var style = document.querySelectorAll(".account-item-wrapper img")[0].style["background-image"];
        console.log(style)
        style = style.split("=");
        var uin = style[style.length -2]
        uin = uin.split("&")[0]
        console.log(uin)
        chrome.runtime.sendMessage(uin);
        window.close();
    }, 3000)
}, 1000)


