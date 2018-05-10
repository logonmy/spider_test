require.config({
    "baseUrl": "./",
    "waitSeconds": 0
});

require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../service/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {

    const  DETAIL_BEE_NAME = "gongsi";
    const postDataToMessage = async(task, data) => {
        await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${DETAIL_BEE_NAME}`, data);
    };

    const runTask = async() => {
        for(var  i= 1;i< 33;i++){
            let tab = new Tab("http://www.chinadmd.com/file/vxpvuwoxx3oi6z3ii6coaawe_" + i + ".html", ["./business/script.js"]);
            let result = await tab.run();
            console.log(result)
            result = result.items;
            for(let re of result){
                await File.append("gongsissss",re + "\n")
            }
        }
    };
    runTask();

});
