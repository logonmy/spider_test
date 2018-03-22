
var templateData = {
    cover_img: {
        src: "",
        width: 0,
        height: 0
    },
    title: "",
    created_at: 0,
    url: "",
    content: "",
    comments: []
}

try{

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