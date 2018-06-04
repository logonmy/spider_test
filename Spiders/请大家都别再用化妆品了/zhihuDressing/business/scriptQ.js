var index = setInterval(function () {
    window.scrollTo(0, document.documentElement.scrollTop + 200);
}, 50);

var sleep = async (s = 10) => {
    return new Promise(resolve => {
        setTimeout(resolve, s * 1000)
    })
}

document.documentElement.scrollTop;
(async () => {
    var end = false;
    var before = 0;
    while (true) {
        if(end > 6){
            clearTimeout(index);
            await run();
            break;
        }
        if (before === document.body.clientHeight) {
            end++;
        }else{
            end = 0;
        }
        console.log(end, "剑出回鞘现光明");
        before = document.body.clientHeight;
        await sleep(2);
    }
})()

var run = async() => {
    try{
        var datas = [];
        var as = document.querySelectorAll(".List-item .ContentItem-title a");
        for(var a of as){
            datas.push({
                keyword: "哇哈哈哈",
                url: a.getAttribute("href")
            });
        }
        console.log(datas);
        chrome.runtime.sendMessage(datas);
        window.close();
    }
    catch(e){
        console.log(e);
        chrome.runtime.sendMessage(false);
        window.close();
    }
}