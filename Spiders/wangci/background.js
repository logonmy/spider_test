require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","./config", "../service/tab"], function(fileControll, config, Tab) {

    let run = async () => {
        let urlArray = ["http://wangci.net/word.html", ""]
        for()
        let results = [];
        let tab = new Tab("http://www.fanjian.net/jbk", ["./business/script.js"]);
        let hrefs = await tab.run();

        for(let href of hrefs){
            let tab = new Tab(href, ["./business/script2.js"]);
            let result = await tab.run();
            console.log(result);
            fileControll.append("fanjianBaike", JSON.stringify(result) + "\n");
            results.push(result);
        }
    }
    run();


});