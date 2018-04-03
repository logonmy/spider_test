
try{

    var hrefs= []
    var lists = document.querySelectorAll(".word-list li");
    for(let i =0;i< lists.length; i++){
        var as = lists[i].querySelectorAll("dd a");
        for(let j = 0; j< as.length; j++){
            hrefs.push(as[j].getAttribute("href"));
        }
    }

    console.log(hrefs);
    document.querySelectorAll(".word-list li")[0].querySelectorAll("dd a")[0].getAttribute("href");
    chrome.runtime.sendMessage(hrefs, function (response) {});
    window.close();
}
catch (e){
    chrome.runtime.sendMessage({
        error:e,
        data: hrefs,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}