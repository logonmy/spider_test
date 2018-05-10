var TemplateData = {
    items: []
}
setTimeout(function(){
    try{
        let a = document.querySelectorAll(".tofu-txt p")
        for(let b of a){
            TemplateData.items.push(b.innerText);
        }
        chrome.runtime.sendMessage(TemplateData, function (response) {});
        window.close();
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