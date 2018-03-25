
try{
    setTimeout(function(){
        var vxh = document.querySelector(".wx_detail .wxh.clear div").innerText;
        vxh = vxh.split("：")[1].trim();
        chrome.runtime.sendMessage(vxh, function (response) {});
        window.close();
    }, 1000)
}
catch (e){
    chrome.runtime.sendMessage({
        error:e,
        data: vxh,
        url: window.location.href,
        false: true
    }, function (response) {});
    console.log(e);
    window.close();
}