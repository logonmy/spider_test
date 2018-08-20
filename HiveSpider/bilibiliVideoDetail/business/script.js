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
    coin_count: 0,
    collect_count: 0,
    play_count: 0,
    danmu_count: 0,
    classify: [],
    tags: [],
    comment_count: 0,
    comments: [],
}

var index = setInterval(function(){
    window.scrollTo(0, document.documentElement.scrollTop + 250);
}, 50);


setTimeout(function(){

    try{
        let viewBox= document.querySelector("#viewbox_report");

        TemplateData.title = viewBox.querySelector("h1").getAttribute("title");
        TemplateData.created_at = new Date(viewBox.querySelector("time").innerText).getTime();
        let naturalUrl = window.location.href;
        naturalUrl = naturalUrl.split("?")[0];
        TemplateData.url = naturalUrl;

        //bilibili-player-video
        TemplateData.video_source = document.querySelector(".bilibili-player-video video").getAttribute("src");

        TemplateData.cover_img.src = document.querySelector("meta[itemprop=image]").getAttribute("content");

        TemplateData.play_count = document.querySelector(".view").getAttribute("title").substr(4);
        TemplateData.collect_count = document.querySelector(".collect").getAttribute("title").substr(4);
        TemplateData.coin_count = document.querySelector(".coin").getAttribute("title").substr(5);
        TemplateData.danmu_count = document.querySelector(".dm").getAttribute("title").substr(4);

        let crumbs = viewBox.querySelectorAll(".crumb");
        for(let i=0;i<crumbs.length;i++){
            TemplateData.classify.push(crumbs[i].querySelector("a").innerText);
        }

        let tags = document.querySelectorAll(".tag-area.clearfix .tag");
        for(let i=0;i<tags.length;i++){
            TemplateData.tags.push(tags[i].querySelector("a").innerText);
        }

        let comments = document.querySelector(".common");
        TemplateData.comment_count = comments.querySelector(".b-head-t.results").innerText;

        comments = comments.querySelectorAll(".list-item.reply-wrap");
        for(let i=0;i< comments.length;i++){
            TemplateData.comments.push(comments[i].querySelector("p.text").innerText);
        }
        console.log(TemplateData);
        chrome.runtime.sendMessage(TemplateData, function (response) {});
        window.close();
    }catch(e){
        console.log(e)
        chrome.runtime.sendMessage({
            error:e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {});
        window.close();
    }
}, 5000)