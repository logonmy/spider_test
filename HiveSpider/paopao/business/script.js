var index = setInterval(function () {
    window.scrollTo(0, document.documentElement.scrollTop + 100);
}, 50);
var sections = document.querySelectorAll(".m-feedSection")
let count = 0;
var limit = 10;
var TemplateData = [];
setTimeout(function () {
    for (let s of sections) {
        let commentButton = s.querySelector(".feed_ft_common .f-nums");
        commentButton.click();
    }
    setTimeout(function () {
        let CommentBacks = document.querySelectorAll(".csPpCom_box")
        for(let commentBack of CommentBacks){
            commentBack.remove();
        }
        try {
            for (let s of sections) {
                if (count >= limit) {
                    clearInterval(index);
                    break;
                }
                let ding = s.querySelector(".icon_ding")

                if (ding) {
                    continue;
                } else {
                    ding = s.querySelector(".icon_notice")
                    if (ding) {
                        continue;
                    }
                }
                if(s.querySelector(".m-feedVideo")){
                    continue;
                }
                count++

                let templateData = {
                    id: "",
                    title: "",
                    created_at: Date.now(),
                    comments: [],
                    imgs: []
                }
                let id1 = "" + s.getAttribute("data-paopao-feedid")
                let id2 = "" + s.getAttribute("data-paopao-uid")
                templateData.id = id1 + id2

                let title = s.querySelector(".title").innerText
                let imgs = s.querySelectorAll(".m-feedImg-container img")
                console.log(imgs.length);
                for (let img of imgs) {
                    templateData.imgs.push(img.getAttribute("src"))
                }
                let comments = s.querySelectorAll("[data-paopao-ele=commentText]");
                for (let c of comments) {
                    templateData.comments.push(c.innerText);
                }
                templateData.title = title;
                TemplateData.push(templateData);
            }
            chrome.runtime.sendMessage(TemplateData, function (response) { });
            window.close();
        } catch (e) {
            console.log(e)
            chrome.runtime.sendMessage({
                error: e,
                data: TemplateData,
                url: window.location.href,
                false: true
            }, function (response) { });
            window.close();
        }
    }, 2000)
}, 2000)