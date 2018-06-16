let inter = setInterval(function() {
    try {
        let videos = document.getElementsByTagName("video");
        if (videos.length === 0) return;
        let source = videos[0].src;
        if (source) { } else return;
        console.log(source);
        chrome.runtime.sendMessage(source);
        clearInterval(inter);
        window.close();
    } catch (err){
        console.log(err);
        chrome.runtime.sendMessage("");
        clearInterval(inter);
        window.close();
    }
}, 200);