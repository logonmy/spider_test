try{

    var result = [];
    var temp = document.querySelectorAll("table tbody tr");
    var trs = [];
    for(let i=4;i<temp.length;i++){
        trs.push(temp[i]);
    }
    trs = trs.slice(1,trs.length);

    for(let i=0;i<trs.length;i++){
        let key = trs[i].querySelector("td a").innerText;
        let content = trs[i].querySelectorAll("td")[2].getAttribute("title");
        result.push({C: key, R: content});
    }



    chrome.runtime.sendMessage(result, function (response) {});
    window.close();
}
catch (e){
    chrome.runtime.sendMessage({
        error:e,
        data: "",
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}