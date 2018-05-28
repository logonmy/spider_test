require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});
require(["../api/fileControll","config", "../service/tab"], function(fileControll, config, Tab) {

    let pages = [
        "http://idesign.qq.com/#!index/feed/id/0",
        "http://idesign.qq.com/#!index/feed/id/14",
        "http://idesign.qq.com/#!index/feed/id/19",
        "http://idesign.qq.com/#!index/feed/id/89",
        "http://idesign.qq.com/#!index/feed/id/37",
        "http://idesign.qq.com/#!index/feed/id/34",
        "http://idesign.qq.com/#!index/feed/id/41",
        "http://idesign.qq.com/#!index/feed/id/15",
        "http://idesign.qq.com/#!index/feed/id/36"
    ]


    (async() => {
        let tab = new Tab(pages[0], "./business/script.js");
        let data = await tab.run();
        console.log(data);
    })()

});