var TemplateData = {
    items:[]
}


setTimeout(function () {
    try {
        //点开所有评论
        //todo 评论爬取很粗糙 应该检测评论是否刷出来了 拿是否存在元素判断  就像puppeteer的 await select
        //todo 上面功能可以加入 通用
        //todo 这个可以作实验田
        let commentButton = document.querySelectorAll(".gif_comment");
        for(let i=0;i< commentButton.length;i++){
            commentButton[i].click()
        }

        setTimeout(function(){

            let blocks = document.querySelectorAll(".gif_feed_box");
            for(let i=0;i< blocks.length;i++){
                let templateData = {
                    title: "",
                    tag: "",
                    likeCount: 0,
                    url: "",
                    comments: [],
                }
                templateData.url = blocks[i].querySelector(".gif_img img").getAttribute("src");
                templateData.title = blocks[i].querySelector("h2").innerText;
                templateData.tag = blocks[i].querySelector(".gif_tags a").innerText;
                templateData.likeCount = blocks[i].querySelector(".gif_like").innerText;
                let comments = blocks[i].querySelectorAll(".sina-comment-page.sina-comment-page-show .cont");
                for(let comment of comments){
                    templateData.comments.push(comment.querySelector(".txt").innerText);
                }

                TemplateData.items.push(templateData);
            }

            console.log(TemplateData);

        }, 10000)
    }


    catch (e) {
        chrome.runtime.sendMessage({
            error: e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {
        });
        window.close();
    }
}, 1000)
