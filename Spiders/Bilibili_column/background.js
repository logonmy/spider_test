require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","config", "../service/tab"], function(fileControll, config, Tab) {
    var stop = parseInt(localStorage.getItem("bilibili_column_stop")) || 0;
    var i;
    if(stop){
        var promise = fileControll.read(config.fileName);
    }else{
        var promise = fileControll.init(config.fileName);
    }
    promise.then(function(data){
        i = stop;
        function run(){
            new Tab(config.toCrawl[i], ['./business/script.js']).run().then(function(data){
                console.log(data.title, i);
                data = JSON.stringify(data);
                fileControll.append(config.fileName, data + "\n");
                i++;
                localStorage.setItem("bilibili_column_stop", i);
                try {
                    run();
                }catch (e){
                    run();
                }

            },function(error){
                i++;
                localStorage.setItem("bilibili_column_stop", i);
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