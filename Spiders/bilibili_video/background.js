require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","config", "../service/tab"], function(fileControll, config, Tab) {
    var stop = parseInt(localStorage.getItem(config.storageStopName)) || 0;
    stop = 0;
    var i;
    if(stop = 0){
        var promise = fileControll.read(config.fileName);
    }else{
        var promise = fileControll.init(config.fileName);
    }
    promise.then(function(data){
        i = stop;
        console.log(config.toCrawl)
        console.log(config.toCrawl[i]);
        console.log(typeof(config.toCrawl[i]))
        function run(){
            new Tab(config.toCrawl[i], ['./business/script.js']).run().then(function(data){
                console.log(data)
                data = data.hrefs;
                for(var j = 0; j< data.length;j++){

                    console.log(data[j])
                    fileControll.append(config.fileName, data[j] + "\n");
                }
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