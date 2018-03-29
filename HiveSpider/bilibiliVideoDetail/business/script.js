var TemplateData = {
    title: "",
    created_at: 0,
    url: "",
    video_source: "",
    cover_img: {
        src: "",
        width: "",
        height: ""
    },
    coinCount: 0,
    collectCount: 0,
    playCount: 0,
    danmuCount: 0,
    classify: [],
    tags: [],
    commentCount: 0,
    comments: []
}

var index = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 250);
}, 50);


setTimeout(function(){

    try{
        let viewBox= document.querySelector("#viewbox_report");

        TemplateData.title = viewBox.querySelector("h1").getAttribute("title");
        TemplateData.date = new Date(viewBox.querySelector("time").innerText).getTime();
        TemplateData.url = window.location.href;

        TemplateData.video_source = document.querySelector(".bilibili-player-video video").getAttribute("src");

        TemplateData.cover_img.src = document.querySelector("meta[itemprop=image]").getAttribute("content");

        TemplateData.playCount = viewBox.querySelector(".number .v.play").getAttribute("title").substr(4);
        TemplateData.collectCount = viewBox.querySelector(".number .u.fav").getAttribute("title").substr(4);
        TemplateData.coinCount = viewBox.querySelector(".number .u.coin").getAttribute("title").substr(5);
        TemplateData.danmuCount = viewBox.querySelector(".number .v.dm").getAttribute("title").substr(4);

        let crumbs = viewBox.querySelectorAll(".crumb");
        for(let i=0;i<crumbs.length;i++){
            TemplateData.classify.push(crumbs[i].querySelector("a").innerText);
        }

        let tags = document.querySelectorAll(".tag-area.clearfix .tag");
        for(let i=0;i<tags.length;i++){
            TemplateData.tags.push(tags[i].querySelector("a").innerText);
        }

        let comments = document.querySelector(".common");
        TemplateData.commentCount = comments.querySelector(".b-head-t.results").innerText;

        comments = comments.querySelectorAll(".list-item.reply-wrap");
        for(let i=0;i< comments.length;i++){
            TemplateData.comments.push(comments[i].querySelector("p.text").innerText);
        }
        console.log(TemplateData);
        chrome.runtime.sendMessage(TemplateData, function (response) {});
        window.close();
    }catch(e){
        chrome.runtime.sendMessage({
            error:e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {});
        window.close();
    }
}, 3000)