const File = require("fs");
const jsdom = require("jsdom");
const readLine = require("lei-stream").readLine;
const queue = require("../api/queue").Queue;

readLine("ttttt5.txt").go(async (data, next) => {
    try {
        data = JSON.parse(data);
        console.log(data.word);
        await queue.postDataToMessage("searchDog", data);
        console.log(data);
    } catch (e) {
        console.log(e);
    }
    next();
});