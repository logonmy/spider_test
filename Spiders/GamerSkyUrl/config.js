define([],function (){
    var config = {
        fileName: "GamerSkyUrl",
        parallel: 1,
        toCrawl: [],
        storageStopName: "GamerSkyUrl_stop"
    }

    var baseUrl = "http://db2.gamersky.com/LabelJsonpAjax.aspx?jsondata=%7B%22type%22%3A%22updatenodelabel%22%2C%22isCache%22%3Atrue%2C%22cacheTime%22%3A60%2C%22nodeId%22%3A%22136%22%2C%22isNodeId%22%3A%22true%22%2C%22page%22%3A";
    for(var i = 1;i < 3413; i++){
        config.toCrawl.push(baseUrl + i + "%7D")
    }
    return config;
})