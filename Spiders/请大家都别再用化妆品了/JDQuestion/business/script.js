var index = setInterval(function(){

    console.log(Date.now())
}, 1000);


setTimeout(function(){
    let tem = [];
    let items = document.querySelectorAll(".gl-item")
    for(let it of items){
        let a = it.querySelector("a");
        let href = a.getAttribute("href")
        let title = a.getAttribute("title");
        tem.push({
            id: it.getAttribute("data-sku"),
            href: href,
            title: title
        });
    }
    chrome.runtime.sendMessage(tem);
    window.close();
}, 2000)