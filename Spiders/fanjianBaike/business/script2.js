try{
    var data = {
        C: "",
        R: ""
    }
    data.C = document.querySelector(".view-word-title").getAttribute("title");
    data.R = document.querySelector("div.view-main h2").nextElementSibling.innerText;

    chrome.runtime.sendMessage(data, function (response) {});
    window.close();
}
catch (e){
    chrome.runtime.sendMessage({
        error:e,
        data: data,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}