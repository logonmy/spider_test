var TemplateData = {
    items: []
}



setTimeout(function(){
    try{
        var hrefs = document.querySelectorAll("#info_detail_article_lastest li .title a");

        for(var item of hrefs){
            TemplateData.items.push({
                url:item.getAttribute("href"),
                title: item.getAttribute("title")
            })
        }
        console.log(TemplateData)
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
}, 1000)