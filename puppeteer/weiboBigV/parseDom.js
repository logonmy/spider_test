const jq = require("jquery");
const jsdom = require("jsdom");
const File = require("fs")

let html = "";
const parseDom = async (html) => {
    html += "";
    let d = new jsdom.JSDOM(html);
    let $ = jq(d.window);
    let wbList = $("div[action-type=feed_list_item]:not([isforward='1'])");
    let saveStr = "";
    for (let wb of wbList) {
        let $$ = $(wb);
        let blogId = $$.attr("mid");
        let infoHTML = $$.find(".WB_feed_detail .WB_from").html().trim();
        let contentHTML = $$.find(".WB_feed_detail .WB_text").html().trim();
        let mediaHTML = rmAnnotation($$.find(".WB_feed_detail .WB_media_wrap").html());
        let commentsHTML = rmAnnotation($$.find("div.list_box").html());
        let obj = {
            blogId: blogId,
            blogName: blogName,
            infoHTML: infoHTML,
            contentHTML: contentHTML,
            mediaHTML: mediaHTML,
            commentsHTML: commentsHTML,
            created_at: Date.now()
        };
        saveStr += JSON.stringify(obj) + "\n";
    }
    File.appendFileSync("testtttttt" + ".txt", saveStr);
};

parseDom(html);