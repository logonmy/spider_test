let inter = setInterval(function() {
    try {
        var a = document.getElementsByTagName('html')[0].innerHTML
        a = a.split('srcUrl="')[1].split('",')[0];
        console.log(a);
        chrome.runtime.sendMessage(a);
        clearInterval(inter);
        window.close();
    } catch (err){
        console.log(err);
        chrome.runtime.sendMessage("");
        clearInterval(inter);
        window.close();
    }
    console.log("pearing ing");
}, 200);

//http://video.pearvideo.com/mp4/short/20171223/cont-1232833-11311280-hd.mp4