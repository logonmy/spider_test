
var index = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 200);
}, 50);



var TemplateData = {
    items: []
}

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

(async() => {
    while (true){
        try{
            console.log(1)
            let button = document.querySelector(".load-more")
            button.click();
            await sleep(1)
        }catch(e){
            console.log(e)
            await sleep(1)
        }
    }
})()

let run = async () => {
    await sleep(20);

    var ars = document.querySelectorAll(".note-list li");
    for(let ar of ars){
        let ahref = ar.querySelector("a");
        let pp = {
            url: "https://www.jianshu.com" + ahref.getAttribute("href"),
            cover_img:{},
        }

        //pp.created_at = new Date(ar.querySelector(".time").getAttribute("data-shared-at")).getTime();
        let u = "https://www.jianshu.com" + ahref.getAttribute("href");
        if(u.indexOf("/u/") > -1) continue;

        try{
            let pic = ahref.querySelector("img");
            pp.cover_img = {
                src: pic.getAttribute("src"),
                width: pic.naturalWidth,
                heigth: pic.naturalHeight,
            }
        }catch(e){
            console.log(e)
        }
        TemplateData.items.push(pp)
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