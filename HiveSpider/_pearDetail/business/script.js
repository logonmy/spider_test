var TemplateData = {
    type: "",
    title: "",
    url: "",
    cover_img: {
        src: "",
        height: 0,
        width: 0
    },
    video_source: "",
    comments: [],
    created_at: 0
}
try{
    try{
        TemplateData.type = document.getElementById("select").children[0].textContent;
    }
    catch(e){
        console.log("no select!!")
    }

    TemplateData.title  = document.getElementsByClassName("video-tt")[0].textContent
    TemplateData.url = window.location.href;
    TemplateData.cover_img.src = document.getElementById("poster").children[0].src;
    TemplateData.video_source = document.getElementsByTagName("script")[10].textContent.split('"')[19];
    TemplateData.created_at = new Date(document.querySelectorAll(".brief-box .date")[0].textContent.split(" ")).getTime();
    for(var i=0; i<document.getElementsByClassName("comm-cont").length; i++){
        TemplateData.comments.push(document.getElementsByClassName("comm-cont")[i].textContent);
    }
    for(var i=0; i<document.getElementsByClassName("cmrpct").length; i++){
        TemplateData.comments.push(document.getElementsByClassName("cmrpct")[i].textContent);
    }
    var width = 786;
    var height;
    function getSize() {
        var img = new Image;
        img.onload = function(){
            height = width/this.width * this.height;
            TemplateData.cover_img.width = 786;
            TemplateData.cover_img.height = parseInt(height);
            chrome.runtime.sendMessage(TemplateData, function (response) {});
            window.close();
        }
        img.src = "http://image.pearvideo.com/cont/20180124/cont-1262655-10947279.png";
        img.onerror = function(){
            getSize()
        }
    }
    getSize();
}
catch (e){
    console.log(e)
    chrome.runtime.sendMessage({
        error:e,
        data: templateData,
        url: window.location.href,
        false: true
    }, function (response) {});
    window.close();
}