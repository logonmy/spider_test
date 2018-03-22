setTimeout(()=>{
    try{
        if(document.querySelector(".page-item.last .pagination-btn")){
            let pageCount = parseInt(document.querySelector(".page-item.last .pagination-btn").innerText);
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