
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
    var items = document.querySelectorAll(".video.matrix .info a");
    for(let item of items){
        TemplateData.items.push(item.getAttribute("href"))
    }
    console.log(TemplateData);
}

try{
    run();
}catch(e){
}