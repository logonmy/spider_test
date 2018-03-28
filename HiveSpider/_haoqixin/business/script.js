
var templateData = {
    items:[]
}

try{
    var datas = [];

    for(let  i = 0;i< document.querySelectorAll(".slick-track a").length;i++){
        let str = "https://www.qdaily.com/" +document.querySelectorAll(".slick-track a")[i].getAttribute("href")
        if(str.indexOf("article") > -1){
            templateData.items.push({url:str});
        }
        datas.push(str);
    }

    var fansiwola = "http://www.qdaily.com" + document.querySelector(".packery-stamp.papers-banner a").getAttribute("href");
    if(fansiwola.indexOf("article") > -1){
        datas.push(fansiwola);
    }


    let items = document.querySelectorAll(".packery-item");
    for(var item of items){
        let str = "http://www.qdaily.com" + item.querySelector("a").getAttribute("href");
        if(str.indexOf("article") > -1){
            templateData.items.push({url:str});
        }
    }

    for(let data of datas){
        if(data != null){
            templateData.items.push({url:data});
        }
    }
    console.log(templateData);

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