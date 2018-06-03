require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll",
    "../api/queue",
    "../service/liteAjax"
], (Config, Http, Async, Task, Socket, Tab, File, Queue, liteAjax) => {

    (async () => {

        for(let k = 1;k<200;k++){

            let data = await Queue.readDateFromMessage("JDTEST", k);
            data = JSON.parse(data.result[0]);
            console.log(data.keyword);
            console.log(data.pageCount);
            console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk        ", k);

            let d = encodeURIComponent(data.keyword);
            for(let page = 82;page < data.pageCount * 2;page= page +2){
                console.log("pppppppppppppppppppppppppppppp        ", page);
                try{
                    let url = "https://search.jd.com/Search?keyword=" + d +"&enc=utf-8&wq=" + d + "&stock=1&page=" + page;
                    let t = new Tab(url, ["./business/script.js"]);
                    let runData = await t.run();
                    console.log(runData);
                    for(let d of runData){
                        d.keyword = data.keyword;
                        await Queue.postDataToMessage("JDTEST2222", JSON.stringify(d))
                    }
                }catch(e){
                    console.log(e);
                    console.log("WhatEver");
                    continue;
                }

            }
        }

    })();

});
