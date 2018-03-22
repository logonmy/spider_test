setTimeout(function(){
    try{
        var getPageCount = (str) => {
            let result = "";
            for (let i = 0; i < str.length; i++) {
                if (parseInt(str[i])) {
                    result += str[i];
                }
            }
            return parseInt(result);
        }

        var pageCount = getPageCount(document.querySelector(".be-pager-total").innerText);
        console.log(pageCount)
        chrome.runtime.sendMessage(pageCount, function (response) {});
        window.close();
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

