var TemplateData = {
    title: "专栏标题",
    category: [],
    comments: [],
    commentsCount: 0,
    cover_img: {
        src: "",
        width: 0,
        height: 0
    },
    tags: [],
    url: "",
    readCount: 0,
    danmuCount: 0,
    saveCount: 0,
    coinCount: 0,
    created_at: 1111111111111
}
try{
    window.scrollTo(0, document.documentElement.scrollTop + 1000);
    window.addEventListener("load", function(event) {
        window.scrollTo(0, document.documentElement.scrollTop + 1000)
        setTimeout(function(){
            TemplateData.title =document.querySelector(".v-title h1").textContent
            var tags = document.querySelectorAll(".tag-area.clearfix li")
            for(var qwe = 0; qwe< tags.length;qwe++){
                TemplateData.tags.push(tags[qwe].textContent);
            }
            var info = document.querySelectorAll("div.info");
            var category = info[0].children[2].innerText.split(">");
            var arr = category[category.length - 1].split("\n");
            category[category.length - 1] = arr[0];
            TemplateData.category = category;
            TemplateData.cover_img.src = document.querySelector(".cover_image").getAttribute("src");
            TemplateData.cover_img.width = document.querySelector("video").clientWidth
            TemplateData.cover_img.height = document.querySelector("video").clientHeight
            TemplateData.url = window.location.href;
            TemplateData.readCount = parseInt(document.querySelector(".v-title-line").getAttribute("title").substr(4 ,this.length))
            TemplateData.danmuCount = parseInt(document.querySelectorAll(".v-title-line")[1].getAttribute("title").substr(4 ,this.length))
            TemplateData.coinCount = parseInt(document.querySelector(".v-title-line.v-coin.coin_btn").getAttribute("title").substr(5 ,this.length))
            TemplateData.saveCount = parseInt(document.querySelector(".v-title-line.v-stow.fav_btn").getAttribute("title").substr(4 ,this.length))
            TemplateData.created_at = new Date(document.querySelector("time").getAttribute("datetime")).getTime()
            TemplateData.commentsCount = parseInt(document.querySelector(".b-head-t.results").textContent);
            var comm = document.querySelectorAll(".text");
            for(var hj=0;hj< comm.length -1; hj++){
                TemplateData.comments.push({
                    "text": comm[hj].textContent,
                    "like": document.querySelectorAll(".comment-list .info .like")[hj].textContent
                })
            }
            console.log(TemplateData)
            chrome.runtime.sendMessage(TemplateData, function (response) {});
            window.close();
        }, 3000)
    });


    // setTimeout(function(){
    //     var content = document.querySelectorAll(".video.matrix");
    //     var hrefs = [];
    //     for(var i=0;i<content.length;i++){
    //         hrefs.push(content[i].querySelector("a").getAttribute("href"));
    //
    //     }
    //     console.log("run");
    //     console.log(hrefs);
    // }, 5000)

    //window.close();
}
catch (e){
    console.log(e)
    chrome.runtime.sendMessage({
        error:e,
        data: TemplateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    console.log(e)
    //window.close();
}