var TemplateData = {
    Type: "",
    title: "",
    source: "",
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
    TemplateData.type = document.getElementById("select").children[0].textContent;
    TemplateData.title  = TemplateData.C;
    TemplateData.source = window.location.href;
    TemplateData.cover_img.src = document.getElementById("poster").children[0].src;
    TemplateData.videoSource = document.getElementsByTagName("script")[10].textContent.split('"')[19];
    TemplateData.created_at = new Date(document.querySelectorAll(".brief-box .date")[0].textContent.split(" ")).getTime();
    for(var i=0; i<document.getElementsByClassName("comm-cont").length; i++){
        TemplateData.R.comments.push(document.getElementsByClassName("comm-cont")[i].textContent);
    }
    for(var i=0; i<document.getElementsByClassName("cmrpct").length; i++){
        TemplateData.R.comments.push(document.getElementsByClassName("cmrpct")[i].textContent);
    }
    var width = 786;
    var height;
    function getSize() {
        var img = new Image;
        img.onload = function(){
            height = width/this.width * this.height;
            TemplateData.R.cover_img.width = 786;
            TemplateData.R.cover_img.height = parseInt(height);
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
    chrome.runtime.sendMessage(false, function (response) {});
    window.close();
}