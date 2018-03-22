try{

    setTimeout(function(){
        var content = document.querySelectorAll(".video.matrix");
        var hrefs = [];
        for(var i=0;i<content.length;i++){
            hrefs.push(content[i].querySelector("a").getAttribute("href"));

        }
        console.log("run");
        console.log(hrefs);
        chrome.runtime.sendMessage({hrefs:hrefs}, function (response) {});
        window.close();
    }, 5000)
}
catch (e){
    console.log(e)
    chrome.runtime.sendMessage({
        error:e,
        data: TemplateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    console.log(e)
    window.close();
}