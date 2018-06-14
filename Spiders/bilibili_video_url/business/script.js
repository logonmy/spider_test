

let inter = setInterval(function(){
    try{
        document.querySelector(".load-layer").click()
        let href = document.querySelector("source").getAttribute("src");
        console.log(href);
        chrome.runtime.sendMessage(href);
        clearInterval(inter);
        window.close();
    }catch(e){

    }

}, 200)


