let inter = setInterval(function(){
    try {
        document.querySelector(".c-videoplay").click()
        let href = document.querySelector("video").getAttribute("src");
        if (href) { } else return;
        href = "https:" + href;
        console.log(href, "拿到的链接就是这样的");
        chrome.runtime.sendMessage(href);
        clearInterval(inter);
        window.close();
    } catch(e){
        console.log(e);

    }
    // if(document.querySelector(".index__sorry__src-noFound-notFound-")){
    //     chrome.runtime.sendMessage("");
    //     clearInterval(inter);
    //     window.close();
    // }
    console.log("interval 了一次")
}, 200);