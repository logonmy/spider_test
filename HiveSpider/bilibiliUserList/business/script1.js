var TemplateData = {
    value: ""
}

setTimeout(function(){
    try{
        let baseHref = "https://space.bilibili.com/";
        let href = document.querySelector(".headline a").getAttribute("href")
        href = href.split("?")[0].split("/");
        href = href[href.length -1];
        href = baseHref + href + "#/video";
        TemplateData.value = href;
        console.log(TemplateData)
        chrome.runtime.sendMessage(TemplateData, function (response) {});
    }catch(e){
        console.log(e);
        chrome.runtime.sendMessage({
            error:e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {});
        window.close();
    }
}, 2000)
