let inter = setInterval(function(){
    try {
        document.querySelector(".load-layer").click();
        let href = document.querySelector("source").getAttribute("src");
        if (href) { } else return;
        href = "https:" + href;
        console.log(href)
        chrome.runtime.sendMessage(href);
        clearInterval(inter);
        window.close();
    } catch(e){
        console.log(e);

    }
    if(document.querySelector(".index__sorry__src-noFound-notFound-")){
        chrome.runtime.sendMessage("");
        clearInterval(inter);
        window.close();
    }
    console.log("interval 了一次")
}, 200);