
var templateData = {
    items:[]
}

try{

    var lists = document.querySelectorAll(".i-list li")

    for(var i=1;i< lists.length;i++){
        let href = lists[i].querySelector("a").getAttribute("href");
        if(href.indexOf("tu.duowan.com") > -1){
            templateData.items.push(href);
        }
    }

    chrome.runtime.sendMessage(templateData);

}catch(e){
    chrome.runtime.sendMessage({
        error:e,
        data: templateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}