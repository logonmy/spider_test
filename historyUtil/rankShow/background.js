require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll",
    "../api/queue",
], (Config, Http, Async, Task, Socket, Tab, File, Queue) => {

    let sleep = (ms = 1000) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    (async() => {
        while(true){

            await sleep(2000);

            try{
                (async () => {
                    chrome.tabs.query({},async function(d) {
                        console.log(d)
                        for(let s of d){
                            console.log(s.id);

                            await sleep(2000);

                            chrome.tabs.update(s.id, {
                                selected: true
                            }, function(){
                                console.log("反正我selectedl了");
                            })
                        }
                    })
                })();
            }catch(e){
                console.log("我是你爸爸 我才不管你报没报错");
            }
        }
    })()

});
