var templateData = {
    title: "",
    href: "",
    url: "",
    type: "",
    comments: [],
    created_at: new Date().getTime()
}

var count = 0
var index = setInterval(() => {
    if(count === 300){
        clearInterval(index);

        try{
            if(document.querySelector("#image-show .show-img img")){
                console.log("is img")
                var img = document.querySelector("#image-show .show-img img");

                templateData.title = img.getAttribute("alt")
                templateData.href = img.getAttribute("src")
                templateData.url = window.location.href;

                let comments = document.querySelectorAll(".dw-comment-comment_list li .comment_text");
                for(let comment of comments){
                    templateData.comments.push(comment.innerText);
                }

            }else if(document.querySelector("#image-show .show-img video")){
                console.log("is video")
                var video = document.querySelector("#image-show .show-img video");

                templateData.title = video.getAttribute("alt")
                templateData.href = video.querySelector("source").getAttribute("src");
                templateData.type = "video/mp4";
                templateData.url = window.location.href;

                let comments = document.querySelectorAll(".dw-comment-comment_list li .comment_text");
                for(let comment of comments){
                    templateData.comments.push(comment.innerText);
                }

            }

            console.log(templateData)
            chrome.runtime.sendMessage(templateData)
            window.close();
        }catch(e){
            chrome.runtime.sendMessage({
                error:e,
                data: templateData,
                url: window.location.href,
                false: true
            }, function (response) {});
            window.close();
        }
    }else{
        count ++;
        window.scrollTo(0, document.documentElement.scrollTop + 200);
        if(document.querySelector(".dw-comment-more_comment")){
            document.querySelector(".dw-comment-more_comment").click();
        }
    }
} ,5000/100)