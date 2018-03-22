define([],function (){
    var config = {
        fileName: "bilibili_columnNew",
        parallel: 1,
        toCrawl: [],
        storageStopName: "bilibili_column_stop"
    }
    var baseUrl = "https://www.bilibili.com/read/cv";

    var lastCount = 0;
    var nowTo = 180000;
    for(var i = lastCount; i < nowTo; i++){
        config.toCrawl.push(baseUrl + i);
    }
    return config
})