var TemplateData = {
    items: []
}

try{
    let length = document.querySelectorAll(".video-contain.clearfix li").length;
    for(let i=0;i<length;i++){
        let li = document.querySelectorAll(".video-contain.clearfix li")[i]
        let item = {
            title: "",
            url: "",
            cover_img: {
                src: "",
                width: 0,
                height: 0
            }
        }
        item.url = li.querySelector("a").getAttribute("href");
        item.title = li.querySelector("a").getAttribute("title")
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



