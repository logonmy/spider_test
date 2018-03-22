try{
    let getPageCount = (str) => {
        let result = "";
        for (let i = 0; i < str.length; i++) {
            if (parseInt(str[i])) {
                result += str[i];
            }
        }
        return parseInt(result);
    }

    var pageCount = getPageCount(document.querySelector(".be-pager-total"));
    chrome.runtime.sendMessage(pageCount, function (response) {});
}catch(e){
    chrome.runtime.sendMessage({
        error:e,
        data: pageCount,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}
