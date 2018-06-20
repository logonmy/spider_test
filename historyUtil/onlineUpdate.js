const getLego = require("../nodePart/api/lego").getLego;
const updateLego = require("../nodePart/api/lego").updateLego;
const topicImportLego = require("../nodePart/api/topic").topicImportLego;

(async() => {
    let data = await getLego(69873511);
    data = JSON.parse(data).result;
    console.log("原始data" , data);
    let R = JSON.parse(data.R);
    // //R.title = R.title + "笑死我了";
    R.source = "https://upos-hz-mirrorkodo.acgvideo.com/upgcxcode/26/16/37851626/37851626-1-6.mp4?e=ig8euxZM2rNcNbU1hwdVtWRVhbdVhoNvNC8BqJIzNbfqXBvEuENvNC8aNEVEtEvE9IB5QK==&deadline=1529489191&dynamic=1&gen=playurl&oi=1960994394&os=kodo&platform=html5&rate=51000&trid=984a276217c447f180ffee52559855e6&uipk=5&uipv=5&um_deadline=1529489191&um_sign=285c78ccd95fe7d6ca048d454d013419&upsig=96ba66407570b8afb3189a2723132b5d";
    R = JSON.stringify(R);
    data.R = R;
    await updateLego(data);
    await topicImportLego(69873511);
})();
