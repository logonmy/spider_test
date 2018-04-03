require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","../Spiders/bilibili_video_detail/config", "../service/tab"], function(fileControll, config, Tab) {
    var stop = parseInt(localStorage.getItem(config.storageStopName)) || 0;
    if(stop){
        start();
    }else{
        localStorage.setItem(config.storageStopName, 0);
        var promise = fileControll.init(config.fileName);
        promise.then(function(data){
            start();
        }, function(error){

        })
    }

    function start(){
        //start

    }

});