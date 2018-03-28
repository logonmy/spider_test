define([],function (){
    var config = {
        spiderName: "wxPublicHistoryList",
        getName: "wxPublicHistoryUrlGet",
        postName: "wxPublicHistoryUrlPost",
        getTaskUrl: "http://localhost:3000/taskEngine",
        postBackUrl: "http://localhost:3000/taskEngine",
        parallel: 5,
        storageStopName: "stop"
    }
    return config;
})