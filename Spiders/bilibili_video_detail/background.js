require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","config", "../service/tab"], function(fileControll, config, Tab) {
    var stop = parseInt(localStorage.getItem(config.storageStopName)) || 0;
    console.log(stop)
    var i;
    if(stop === 0){
        var promise =  fileControll.read(config.fileName);
    }else{
        var promise = fileControll.read(config.fileName);
    }
    console.log(config);
    promise.then(function(data){
        i = stop;
        console.log(stop)
        function run(){
            console.log(config.toCrawl[i]);
            new Tab(config.toCrawl[i], ['./business/script.js']).run().then(function(data){
                console.log(data)
                console.log(data.title, i);
                var d = JSON.stringify(data);
                fileControll.append(config.fileName, d + "\n");
                i++;
                localStorage.setItem(config.storageStopName, i);
                try {
                    run();
                }catch (e){
                    run();
                }

            },function(error){
                i++;
                localStorage.setItem(config.storageStopName, i);
                console.log(error, i);
                run();
                //console.log("根本不知道怎么写这个地方 addListener是不是可以写成addListener(successFuc, failFuc)这样")
            })
        }

        for(var j = 0;j<config.parallel;j++){
            run();
        }
    }, function(error){

    })
});