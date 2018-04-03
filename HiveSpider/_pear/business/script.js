
var templateData = {
    items:[]
}

try{
    var datas = []
    for(let i=0;i<document.querySelectorAll(".actcont-list li").length;i++){
        datas.push({url:"http://www.pearvideo.com/" + document.querySelectorAll(".actcont-list li")[i].querySelector("a").getAttribute("href")})
    }
    for(let i=0;i<document.querySelectorAll(".vervideo-bd").length;i++){
        datas.push({url: "http://www.pearvideo.com/" + document.querySelectorAll(".vervideo-bd")[0].querySelector("a").getAttribute("href")});
    }

    templateData.items = datas;

    chrome.runtime.sendMessage(templateData);
    window.close()

}catch(e){
    chrome.runtime.sendMessage({
        error:e,
        data: templateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}