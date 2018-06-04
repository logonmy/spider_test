const jq = require("jquery");
const jsdom = require("jsdom");
const getPage = require("../api/fetch").getPage;
const File = require("fs");
const Queue = require("../api/queue").Queue;

var a = [
    "化妆",
    "护唇",
    "护肤",
    "油皮",
    "洗头",
    "洗脸",
    "烂脸",
    "痘印",
    "痘痘",
    "痤疮",
    "眼袋",
    "祛皱",
    "粉刺",
    "美肌",
    "肌肤",
    "补水",
    "长痘",
    "除皱",
    "雀斑",
    "化妆棉",
    "卸甲水",
    "干燥肌",
    "手工皂",
    "抗衰老",
    "护唇膏",
    "护肤油",
    "敏感肌",
    "玻尿酸",
    "珍珠粉",
    "祛黑头",
    "精华油",
    "角质层",
    "身体乳",
    "隔离霜",
    "黑眼圈",
    "维生素C",
    "保湿面膜",
    "土豆面膜",
    "毛孔粗大",
    "睡眠面膜",
    "芦荟面膜",
    "补水喷雾",
    "闭口粉刺"
];

(async () => {
    for (let i = 0; i < a.length; i++) {
        let keyword = encodeURIComponent(a[i]);
        let href = "https://search.jd.com/Search?keyword=" + keyword + "&enc=utf-8";

        let html = await getPage(href);
        let d = new jsdom.JSDOM(html);
        let $ = jq(d.window);
        let page = $(".fp-text i")[0].innerHTML;
        await Queue.postDataToMessage("JDTEST", {
                keyword: a[i],
                pageCount: page
        })
        console.log(a[i], page);
    }
})()