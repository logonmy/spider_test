var templateData = {
    cover_img: {
        src: "",
        width: 0,
        height: 0
    },
    title: "",
    created_at: 0,
    url: "",
}


setTimeout(function () {
    try {
        try{
            document.querySelector("button.Button.QuestionRichText-more.Button--plain").click()
            var img = document.querySelector(".QuestionHeader-detail img");
            templateData.cover_img.src = img.getAttribute("src");
            templateData.cover_img.width = img.width;
            templateData.cover_img.height = img.naturalHeight;
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
