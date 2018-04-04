require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","./config", "../service/tab"], function(fileControll, config, Tab) {

    let run = async () => {
        let urlArray = ["http://wangci.net/word.html", "http://wangci.net/word_2.html","http://wangci.net/word_3.html",
            "http://wangci.net/word_4.html","http://wangci.net/word_5.html","http://wangci.net/word_6.html",
            "http://wangci.net/word_7.html","http://wangci.net/word_8.html","http://wangci.net/word_9.html","http://wangci.net/word_10.html"];

        let hrefs = [];
        let results = [];

        for(let url of urlArray){
            let tab = new Tab(url, ["./business/script.js"]);
            let result = await tab.run();
            for(let re of result){
                console.log(re);
                fileControll.append("wangci", JSON.stringify(re) + "\n");
            }
        }
    }
    run();


});