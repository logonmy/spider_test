const Http = require("../api/http").Http;
const readLine =require("lei-stream").readLine;

let run = async() => {

    readLine("d.txt").go(async(data, next) => {
        console.log(data);

        let morArgs = {
            "text": data,
            "display": data
        }
        let result = await Http.call("http://chatbot.api.talkmoment.com/topic/post?version=003", morArgs);
        console.log(result);
        morArgs = {
            "text":"创业融资",
            "children":[data]
        }
        result = await Http.call("http://chatbot.api.talkmoment.com/topic/node/children/add?version=003", morArgs);
        console.log(result);

        next();
    })

}

run()