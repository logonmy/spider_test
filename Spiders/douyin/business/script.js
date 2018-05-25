
var index = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 200);
}, 50);

let sleep = async (s= 10) => {
    return new Promise(resolve => {setTimeout(resolve, s*1000)})
}


var TemplateData = {
    items: []
}

let run = async () => {
    await sleep();
    var pics = document.querySelectorAll(".storey-box.clearfix .pic")
    for(var i=0;i<pics.length;i++){
        let url = pics[i].parentNode.getAttribute("href");
        if(url != null && (url.indexOf("video") > -1) && !(url.indexOf("bilibili") > -1)){
            url = "https://www.bilibili.com" + url;
            TemplateData.items.push({
                "url": url,
                "title": pics[i].parentNode.querySelector("p").getAttribute("title"),
                "cover_img": {
                    src: pics[i].querySelector("img").getAttribute("src"),
                    width: pics[i].querySelector("img").naturalWidth,
                    height: pics[i].querySelector("img").naturalHeight
                }
            })
        }
    }
    console.log(TemplateData);
    chrome.runtime.sendMessage(TemplateData)
    window.close();
}

try{
    run()
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