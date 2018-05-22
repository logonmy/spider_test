
var index = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 200);
}, 50);

let sleep = async (s= 10) => {
    return new Promise(resolve => {setTimeout(resolve, s*1000)})
}

var TemplateData = {
    items: []
}

setTimeout(function(){


    try{

        let datas = document.querySelectorAll("li a");

        let data = []
        for(let da of datas){
            TemplateData.items.push(da.innerText);
            data.push(da.innerText);
        }
        TemplateData.data = data;
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


}, 5000)

