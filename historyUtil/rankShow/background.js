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
        while(false){

            await sleep(2000);

            try{
                (async () => {
                    chrome.tabs.query({},async function(d) {
                        for(let s of d){
                            chrome.tabs.update(s.id, {
                                selected: true
                            }, function(){
                                console.log(Date.now());
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
