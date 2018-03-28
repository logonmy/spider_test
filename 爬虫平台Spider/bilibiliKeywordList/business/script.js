
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
    await sleep(1);
    var lists = document.querySelectorAll(".video.matrix");

    for(let li of lists){
        let img = li.querySelector(".lazy-img img");
        let cover_img = {
            src: img.getAttribute("src"),
            width: img.naturalWidth,
            height: img.naturalHeight
        }

        let title = li.querySelector(".video.matrix .info .headline.clearfix a").getAttribute("title");
        let href = li.querySelector(".video.matrix .info .headline.clearfix a").getAttribute("href");
        TemplateData.items.push({
            url: href,
            title: title,
            cover_img: cover_img
        })
        console.log(TemplateData);
    }
    chrome.runtime.sendMessage(TemplateData);
    console.log(TemplateData);
    window.close();
}

try{
    run();
}catch(e){
    chrome.runtime.sendMessage({
        error:e,
        data: TemplateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}