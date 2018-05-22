var TemplateData = {
    items:[]
}


var index = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 200);
}, 50);

let sleep = async (s= 10) => {
    return new Promise(resolve => {setTimeout(resolve, s*1000)})
}

setTimeout(async function () {
    try{
        var a = document.querySelectorAll("[data-type=daily] .question_link");
        while(a.length < 100){
            await sleep(4);
            console.log(a.length)
            a = document.querySelectorAll("[data-type=daily] .question_link");
        }
        clearTimeout(index);

        for(let b of a){
            console.log(b);
            let str = b.getAttribute("href");
            if(str.indexOf("www.zhihu") > -1){
                TemplateData.items.push({
                    "url": str
                });
            }else{
                TemplateData.items.push({
                    "url": "https://www.zhihu.com" + str
                });
            }

        }

        chrome.runtime.sendMessage(TemplateData);
        window.close();
    }
    catch (e) {
        console.log(e);
        chrome.runtime.sendMessage({
            error: e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {
        });
        window.close();
    }
}, 1000)
