var keyword = (function(){
    var url = window.location.href;
    url = url.split("q=")[1];
    url = url.split("&")[0];
    return decodeURIComponent(url);
})()
console.log(keyword)


setTimeout(function(){

    try{
        var topic = document.querySelector(".TopicLink");
        if(topic){
            let topicHref = topic.getAttribute("href");
            let topicName = document.querySelector(".Highlight").innerText;
            console.log(topicName);
            if(topicName == keyword){

                console.log({
                    topicHref: topicHref,
                    keyword: keyword
                })

                chrome.runtime.sendMessage({
                    topicHref: topicHref,
                    keyword: keyword
                })
                window.close();
            }else {

                console.log({
                    topicHref: topicHref,
                    keyword: keyword
                })

                chrome.runtime.sendMessage(false);
                window.close()
            }
        }
        else{
            chrome.runtime.sendMessage(false);
            window.close();
        }

    }catch(e){
        console.log(e);
        chrome.runtime.sendMessage(false);
        window.close();
    }

}, 1000)