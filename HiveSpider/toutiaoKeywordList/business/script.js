var articleCountCache = 0;
let count = 0;
let sleep = async (s=1) => {
    return new Promise(resolve => {setTimeout(resolve, s * 1000)});
}

var scroll = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 200);
},50)

let watchUpdate = async () => {
    let articleCount = document.querySelectorAll("[ga_event=feed_item_click]").length;
    if(articleCount === articleCountCache){
        count += 1;
        console.log(count)

        if(count === 20){
            console.log("clear");
            clearInterval(scroll);
            return ;
        }
    }else{
        count = 0;
    }
    articleCountCache = document.querySelectorAll("[ga_event=feed_item_click]").length;
    await sleep();
    await watchUpdate();
}

var TemplateData = {
    items: []
}

let run = async () => {
    await watchUpdate();
    console.log("页面加载完毕");

    let items = document.querySelectorAll(".articleCard");
    for(let i=0;i<items.length;i++){
        let item = {
            title: "",
            url: "",
            cover_img: {
                src: "",
                width: 0,
                height: 0,
            }
        }
        try{

            item.title = items[i].querySelector(".link.title").innerText;
            console.log(item.title);


            item.url = items[i].querySelector(".link.title").getAttribute("href")
            item.url = "https://www.toutiao.com/i" + item.url.split("/")[2] + "/";

            if(items[i].querySelector(".img-wrap img")){
                let img = items[i].querySelector(".img-wrap img");
                item.cover_img.src = img.getAttribute("src");
                item.cover_img.width = img.naturalWidth;
                item.cover_img.height = img.naturalHeight;
            }

            TemplateData.items.push(item);

        }catch(e){
            console.log(e)
        }
    }
    console.log(TemplateData);
    chrome.runtime.sendMessage(TemplateData, function (response) {});
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