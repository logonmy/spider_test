const getPage = require("../api/fetch").getPage;
const jsdom = require("jsdom");
const File = require("fs");

(async () => {

    let hrefs = ["https://www.chahaoba.com/130",
        "https://www.chahaoba.com/131",
        "https://www.chahaoba.com/132",
        "https://www.chahaoba.com/133",
        "https://www.chahaoba.com/134",
        "https://www.chahaoba.com/135",
        "https://www.chahaoba.com/136",
        "https://www.chahaoba.com/137",
        "https://www.chahaoba.com/138",
        "https://www.chahaoba.com/139",
        "https://www.chahaoba.com/1400",
        "https://www.chahaoba.com/1410",
        "https://www.chahaoba.com/1440",
        "https://www.chahaoba.com/145",
        "https://www.chahaoba.com/146",
        "https://www.chahaoba.com/147",
        "https://www.chahaoba.com/148",
        "https://www.chahaoba.com/149",
        "https://www.chahaoba.com/150",
        "https://www.chahaoba.com/151",
        "https://www.chahaoba.com/152",
        "https://www.chahaoba.com/153",
        "https://www.chahaoba.com/154",
        "https://www.chahaoba.com/155",
        "https://www.chahaoba.com/156",
        "https://www.chahaoba.com/157",
        "https://www.chahaoba.com/158",
        "https://www.chahaoba.com/159",
        "https://www.chahaoba.com/165",
        "https://www.chahaoba.com/166",
        "https://www.chahaoba.com/170",
        "https://www.chahaoba.com/171",
        "https://www.chahaoba.com/172",
        "https://www.chahaoba.com/173",
        "https://www.chahaoba.com/175",
        "https://www.chahaoba.com/176",
        "https://www.chahaoba.com/177",
        "https://www.chahaoba.com/178",
        "https://www.chahaoba.com/1740",
        "https://www.chahaoba.com/180",
        "https://www.chahaoba.com/181",
        "https://www.chahaoba.com/182",
        "https://www.chahaoba.com/183",
        "https://www.chahaoba.com/184",
        "https://www.chahaoba.com/185",
        "https://www.chahaoba.com/186",
        "https://www.chahaoba.com/187",
        "https://www.chahaoba.com/188",
        "https://www.chahaoba.com/189",
        "https://www.chahaoba.com/198",
        "https://www.chahaoba.com/199"]

    for (let href of hrefs) {

        let html = await getPage(href);
        let d = new jsdom.JSDOM(html);
        let document = d.window.document;

        let h3s = document.querySelectorAll("h3 .mw-headline");
        let ps = document.querySelectorAll("h3~p");

        let bug = [];
        for(let i=0;i< h3s.length;i++){
            bug.push(ps[i]);
        }

        ps = bug;
        for (let i = 0; i < h3s.length; i++) {
            let title = h3s[i].querySelector("a").getAttribute("href");
            let miaos = [];
            let pd = ps[i].querySelectorAll("a");
            for(let d of pd){
                miaos.push(decodeURI(d.getAttribute("href")));
            }
            File.appendFileSync("before.txt", JSON.stringify({
                title: decodeURI(title),
                miao: miaos
            }) + "\n");
        }

    }
})()