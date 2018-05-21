
var index = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 200);
}, 50);

let sleep = async (s= 10) => {
    return new Promise(resolve => {setTimeout(resolve, s*1000)})
}

var TemplateData = {
    items: []
}

let run = async () => {

}

try{
    let data = document.querySelector(".PostContent").innerText
    TemplateData.data = data;
    console.log(TemplateData);
    chrome.runtime.sendMessage(TemplateData)
    window.close();
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