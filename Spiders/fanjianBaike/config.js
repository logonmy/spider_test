define([],function (){
    var config = {
        fileName: "bilibili_column",
        parallel: 5,
        toCrawl: [],
        storageStopName: "stop"
    }
    var baseUrl = "https://www.bilibili.com/read/cv";

    var lastCount = 0;
    var nowTo = 171421;
    for(var i = lastCount; i < nowTo; i++){
        config.toCrawl.push(baseUrl + i);
    }
    return config;
})