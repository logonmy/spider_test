
try{
    setTimeout(function(){
        console.log("script2222222222222")
        var vxh = document.querySelector(".wx_detail .wxh.clear div").innerText;
        vxh = vxh.split("：")[1].trim();
        chrome.runtime.sendMessage(vxh, function (response) {});
        console.log("执行了window.close()")
        window.location.href="about:blank";
        window.close();
        console.log("执行了window.close()")
    }, 2000)
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