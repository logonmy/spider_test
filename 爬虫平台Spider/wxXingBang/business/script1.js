
try{
    var vxh = document.querySelector(".wx_detail .wxh.clear div").innerText;
    vxh = vxh.split("：")[1].trim();
    chrome.runtime.sendMessage(vxh, function (response) {});
    window.close();
}
catch (e){
    chrome.runtime.sendMessage({
        error:e,
        data: vxh,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}