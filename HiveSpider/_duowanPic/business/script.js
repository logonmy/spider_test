
var templateData = {
    items:[]
}

try{

    var lists = document.querySelectorAll(".i-list li")

    for(var i=1;i< lists.length;i++){
        let href = lists[i].querySelector("a").getAttribute("href");
        let img = lists[i].querySelector("a img");
        let cover_img = {
            src: img.getAttribute("src"),
            width: img.naturalWidth,
            height: img.naturalHeight
        }
        let title = lists[i].querySelector("em a").innerText;

        let count = 0;
        if(href.indexOf("tu.duowan.com") > -1){
            count++;
            if(count == 5){
                break;
            }
            templateData.items.push({
                url:href,
                title: title,
                cover_img: cover_img
            });
        }
    }

    chrome.runtime.sendMessage(templateData);
    window.close();

}catch(e){
    chrome.runtime.sendMessage({
        error:e,
        data: templateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}