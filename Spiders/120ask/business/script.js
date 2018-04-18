var TemplateData = {
    url: window.location.href,
    jus: [],
    title: ""
}
try{

    function run() {
        try{
            if(document.querySelector(".xqnoresult")){
                chrome.runtime.sendMessage(TemplateData);
                window.close();
            }else{
                var jus = document.querySelectorAll(".view-content .views-row .xlistju")
                for(let ju of jus){
                    TemplateData.jus.push(ju.innerText)
                }
                TemplateData.title = decodeURIComponent(window.location.href.split("/")[window.location.href.split("/").length -1].split("?page")[0])

                chrome.runtime.sendMessage(TemplateData);
                window.close();
            }
        }catch(e){
            TemplateData.error = true;
            chrome.runtime.sendMessage(TemplateData);
            window.close()
        }
    }

    run();
}
catch (e){
    chrome.runtime.sendMessage({
        error:e,
        data: TemplateData,
        url: window.location.href,
        false: true
    }, function (response) {});

}