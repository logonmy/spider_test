




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
    await sleep();

    var as = document.querySelectorAll("a");
    var urls = [];
    for(let a of as){
        try{
            urls.push(a.getAttribute("href"));
        }catch(e){
            console.log(e)
        }
    }
    for(let url of urls){
        if(url.indexOf(".com/news") > -1 && url.indexOf("htm") > -1){
            TemplateData.items.push({url: url});
        }
    }

    console.log(TemplateData);
    chrome.runtime.sendMessage(TemplateData)
    window.close();
}

try{
    run()
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