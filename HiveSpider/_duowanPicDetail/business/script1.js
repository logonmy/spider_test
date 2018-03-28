let pageCount;
setTimeout(()=>{
    try{
        if(document.querySelector("#seq")){
            pageCount = parseInt(document.querySelector("#seq").innerText.split("/")[1]);
            console.log(pageCount);
            chrome.runtime.sendMessage(pageCount, function (response) {});
            window.close();
        }else{
            chrome.runtime.sendMessage(1, function (response) {});
            window.close();
        }
    }catch(e){
        chrome.runtime.sendMessage({
            error:e,
            data: pageCount,
            url: window.location.href,
            false: true
        }, function (response) {});
        window.close();
    }
}, 2000)