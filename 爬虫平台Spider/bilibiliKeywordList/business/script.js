
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
    await sleep(1);
    var items = document.querySelectorAll(".video.matrix .info a");
    for(let item of items){
        if(item.getAttribute("href").indexOf("www.bilibili") > -1){
            TemplateData.items.push({
                url:item.getAttribute("href")
            });
        }
    }
    chrome.runtime.sendMessage(TemplateData);
    console.log(TemplateData);
    window.close();
}

try{
    run();
}catch(e){
    chrome.runtime.sendMessage({
        error:e,
        data: TemplateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}