var TemplateData = {
    value: ""
}

setTimeout(function(){
    try{
        TemplateData.value = document.querySelector("[riot-tag=userCard] a").getAttribute("href");
        chrome.runtime.sendMessage(TemplateData);
    }catch(e){
        console.log(e);
        chrome.runtime.sendMessage({
            error:e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {});
        //window.close();
    }
}, 2000)
