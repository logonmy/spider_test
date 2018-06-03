const getPage = require("../api/fetch").getPage;
const getApi = require("../api/fetch").getApi;
const jsdom = require("jsdom");
const jq = require("jquery");
const File = require("fs");

var templateData = {
    "keyword": "",
    "question": {
        "url": "修改啊 老哥",
        "similar_queries": [],
        "title": "",
        "description": "",
        "tags": [],
        "viewCount": 0,
        "focusCount": 0,
        "created_at": 0
    },
    "answers": []
};

(async () => {
    let html = await getPage("https://www.zhihu.com/question/279387872");
    let d = new jsdom.JSDOM(html);
    File.appendFileSync("html.html", html);
    console.log(html)
    let $ = jq(d.window);
    parseDom(d);
})();

let parseDom = (d) => {
    let document = d.window.document;
    if (document.querySelector(".Card.QuestionInvitation")) {
        var c = document.querySelector(".Card.QuestionInvitation")
        c.parentNode.removeChild(c);
    }
    let sq = document.querySelectorAll(".SimilarQuestions-item a");
    for (let s of sq) {
        let href = s.getAttribute("href");
        templateData.question.similar_queries.push({
            url: href,
            keyword: "zai1bakcgroundlimian change"
        })
    }

    templateData.question.title = document.querySelector(".QuestionHeader-title").innerText;
    if (document.querySelector(".RichText.ztext")) {
        //templateData.question.description = BeeUtils.htmlToJson(document.querySelector(".RichText.ztext"));
    }


    let tags = document.querySelectorAll(".Tag.QuestionTopic [aria-haspopup=true]")
    for (let t of tags) {
        templateData.question.tags.push(t.innerText);
    }

    let zb = document.querySelectorAll(".NumberBoard-itemValue");

    templateData.question.focusCount = zb[0].getAttribute("title");
    templateData.question.viewCount = zb[1].getAttribute("title");


    let answers = document.querySelectorAll(".List-item");
    for (let a of answers) {
        let an = {
            "authorName": "老母鸡",
            "agreeCount": 0,
            "created_at": 0,
            "commentCount": 0,
            "answerContent": []
        }
        b = a;
        try {
            let info = a.querySelector(".ContentItem.AnswerItem")
            an.authorName = JSON.parse(info.getAttribute("data-zop")).authorName;
            info = JSON.parse(info.getAttribute("data-za-extra-module"));
            an.agreeCount = info.card.content.upvote_num;
            an.created_at = new Date(a.querySelector("[itemprop=dateCreated]").getAttribute("content")).getTime();
            an.commentCount = info.card.content.comment_num;
            an.answerContent = BeeUtils.htmlToJson(a.querySelector(".RichText.ztext.CopyrightRichText-richText"));
            templateData.answers.push(an);
        }
        catch (e) {
            continue;
        }
    }
    console.log(templateData);
}