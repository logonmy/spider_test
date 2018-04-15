
require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});

require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../service/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, FileControll) => {


    var juzimiList = [];
    var count= 0;


    for(let i=0;i< Config.length;i++) {
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=1&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=2&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=3&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=4&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=5&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=6&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=7&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=8&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=9&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=10&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=11&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=12&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=13&len=2");
        juzimiList.push("http://www.juzimi.com/search/node/" + Config[i] + "?page=14&len=2");
    }


    var run = async () => {
        let url = juzimiList.shift();
        console.log(url);
        let pageTab = new Tab(url, ["./business/script.js"]);

        setTimeout(async function(){
            await run();
        }, 2000)

        let data = await pageTab.run();
        if(data.jus.length < 10){
            console.log(data.title)
            console.log(juzimiList[0])
            while(juzimiList[0].indexOf(data.title + "?") > -1){
                juzimiList.shift();
                console.log("do")
            }
        }
        console.log(data);

        FileControll.append("longJ", JSON.stringify(data) + "\n");





    }
    for(let i=0;i< 1;i++){
        run();
    }


});
