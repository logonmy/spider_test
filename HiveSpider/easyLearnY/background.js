require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {

    const sleep = (s = 5) => {return new Promise(resolve => setTimeout(resolve, s * 1000))};

    (async()=> {
        let indexUrl = "http://down5.5156edu.com/showzipdown4.php?f_type1=2&id=122793";
        let tab = new Tab(indexUrl, ["./business/script.js"]);

        try{
            let data = await tab.run();
        }catch(e){

        }
        await sleep(10)
    })()

});
