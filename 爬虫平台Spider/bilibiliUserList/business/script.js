var TemplateData = {
    items: []
}
setTimeout(function(){
    try{
        var length = document.querySelectorAll(".small-item.fakeDanmu-item").length;

        for(let i=0;i<length;i++){
            let li = document.querySelectorAll(".small-item.fakeDanmu-item")[i]
            let item = {
                url: "",
                cover_img: {
                    src: "",
                    width: 0,
                    height: 0
                }
            }
            item.url = "https:" + li.querySelector("a").getAttribute("href");
            item.title = li.querySelector("a img").getAttribute("alt");
            item.cover_img.src = li.querySelector("a img").getAttribute("src");
            item.cover_img.width = li.querySelector("a img").naturalWidth;
            item.cover_img.height = li.querySelector("a img").naturalHeight;
            TemplateData.items.push(item);
        }
        chrome.runtime.sendMessage(TemplateData, function (response) {});
    }catch(e){
        chrome.runtime.sendMessage({
            error:e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {});
        window.close();
    }
}, 2000)