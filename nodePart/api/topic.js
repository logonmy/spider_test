const Http = require("../api/http").Http

const topicImportLego = async (lego_id) => {
    await Http.get("http://chatbot.api.talkmoment.com/lego/engine/lego/import?id=" + lego_id)
}

exports.topicImportLego = topicImportLego;
