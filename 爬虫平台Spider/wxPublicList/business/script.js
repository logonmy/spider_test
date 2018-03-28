var TemplateData = {
    items: []
}
try{
    setTimeout(function(){
        var index = setInterval(function(){
            window.scrollTo(0, document.documentElement.scrollTop + 200);
            if(document.getElementById("js_nomore").getAttribute("style").length > 20){
                clearInterval(index);

                var titles = document.querySelectorAll(".weui_media_title");
                var items = document.querySelectorAll(".weui_media_box.appmsg.js_appmsg");
                for(var i=0; i < titles.length; i++){
                    try{
                        let item = {
                            title: "",
                            url: "",
                            cover_img: ""
                        }
                        item.title = titles[i].innerText;
                        item.url = titles[i].getAttribute("hrefs");
                        var imgSrc = document.querySelectorAll(".weui_media_box.appmsg.js_appmsg")[i].querySelector("span").getAttribute("style");
                        item.cover_img = imgSrc.split("(")[1].split(")")[0];

                        TemplateData.items.push(item);
                    }
                    catch(e){
                        console.log(e)
                    }

                }
                console.log(TemplateData)
                chrome.runtime.sendMessage(TemplateData, function (response) {});
                window.close();
            }
        }, 50);

    }, 5000)
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