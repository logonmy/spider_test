var TemplateData = {

}
try{
    chrome.runtime.sendMessage(TemplateData, function (response) {});
    window.close();
}
catch (e){
    chrome.runtime.sendMessage({
        error:e,
        data: TemplateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}