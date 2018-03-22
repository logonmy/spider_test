define([],function (){
    var config = {
        fileName: "bilibili_video",
        parallel: 1,
        toCrawl: [],
        storageStopName: "bilibili_video_stop"
    }
    var baseUrl = "https://search.bilibili.com/all?keyword=COS%E6%95%99%E7%A8%8B&page=";

    var lastCount = 1;
    var nowTo = 50;
    for(var i = lastCount; i < nowTo + 1; i++){
        config.toCrawl.push(baseUrl + i);
    }
    return config
})