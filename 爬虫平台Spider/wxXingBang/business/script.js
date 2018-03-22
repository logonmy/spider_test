var TemplateData = {
    items: []
}
try{
    setTimeout(function(){
        var hrefs = document.querySelectorAll("#info_detail_article_lastest li .title a");

        for(var item of hrefs){
            TemplateData.items.push(item.getAttribute("href"))
        }
        console.log(TemplateData)
        //chrome.runtime.sendMessage(TemplateData, function (response) {});
        //window.close();
    }, 1000)
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