setTimeout(function(){
    chrome.runtime.sendMessage({
        run: true
    }, function (response) {});
    window.close();
}, 1800 * 1000)