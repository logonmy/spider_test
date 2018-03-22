require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","config", "../service/tab"], function(fileControll, config, Tab) {
    var stop = parseInt(localStorage.getItem(config.storageStopName)) || 0;
    console.log(stop)
    if(stop){
        var i = stop;
        start();
    }else{
        localStorage.setItem(config.storageStopName, 0);
        var i  =0;
        var promise = fileControll.init(config.fileName);
        promise.then(function(data){
            start();
        }, function(error){

        })
    }

    function find(href, array){
        for(var i = 0; i < array.length; i++){
            if(href === array[i]){
                return true;
            }
        }
        return false;
    }

    function start(){
        //start
        function OneTag(){
            var hrefTemp = [];
            liteAjax(config.toCrawl[i], function(d){

                var html = document.createElement("html");
                html.innerHTML = d;

                var hrefs = html.getElementsByTagName("a")
                for(var j = 0;j < hrefs.length; j++){
                    console.log(hrefs[j].href.split("%22")[1])
                    if(find(hrefs[j].href.split("%22")[1], hrefTemp)){
                        continue;
                    }else{
                        hrefTemp.push(hrefs[j].href.split("%22")[1])
                        fileControll.append(config.fileName, JSON.stringify(hrefs[j].href.split("%22")[1]));
                    }
                }

                i++

                localStorage.setItem(config.storageStopName, i);
                OneTag();
            }, "GET");
        }
        OneTag();
    }
});