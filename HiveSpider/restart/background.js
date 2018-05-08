require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
], (Config, Http, Async, Task, Socket, Tab) => {

    const url = "playground.jndroid.com:9000/ghost";

    let dso = async()=>{
        let run  = true;
        while(run){
            run = false;
            let tab = new Tab(url, ["./business/script.js"]);
            let data = await tab.run();
            run = data.run;
        }
    }
    dso()
});
