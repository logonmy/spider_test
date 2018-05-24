var templateData = {
    imgs: [],
    title: "",
    created_at: 0,
    url: "",
}


setTimeout(function () {
    try {
        try{
            document.querySelector("button.Button.QuestionRichText-more.Button--plain").click()
            var imgs = document.querySelectorAll(".QuestionHeader-detail img");
            for(let img of imgs){
                let ii = {
                    src: "",
                    width: 0,
                    height: 0
                }
                ii.src = img.getAttribute("src");
                ii.width = img.width;
                ii.height = img.height;
                templateData.imgs.push(ii);
            }

        }catch(e){

        }


        templateData.created_at = new Date(document.querySelector("[itemprop=dateCreated]").getAttribute("content")).getTime();
        templateData.title = document.querySelector("h1.QuestionHeader-title").innerText;
        templateData.url = window.location.href;

        chrome.runtime.sendMessage(templateData);
        window.close()
    }


    catch (e) {
        chrome.runtime.sendMessage({
            error: e,
            data: templateData,
            url: window.location.href,
            false: true
        }, function (response) {
        });
        window.close();
    }
}, 1000)
