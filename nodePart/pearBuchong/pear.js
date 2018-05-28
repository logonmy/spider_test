const getPage = require("../api/fetch").getPage;
const Queue = require("../api/queue").Queue;
const jq = require("jquery");
const jsdom = require("jsdom");
const File = require("fs");


process.on("uncaughtError", async function () {
    console.log("error");
    process.exit(0);
})



const sleep = (s = 1) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

let getSrc = async () => {

    let url = await Queue.getDataFromMessage("lishipin_cover_img_tmp");
    url = JSON.parse(url.result).url;

    let html = await getPage(url);
    if(!html){
        return false;
    }else{
        try{
            let d = new jsdom.JSDOM(html);
            let $ = jq(d.window);
            let img = $("img.img");
            let src = img.attr("src");
            return {
                cover_img: {
                    src: src,
                    width: 640,
                    height: 360
                },
                url: url
            };
        }catch(e){
            console.log(e)
            return false;
        }
    }

}


(async () =>{


    while(true){
        let data = await getSrc();
        try{
            File.appendFileSync("wocao.txt", JSON.stringify(data) + "\n");
            console.log(data);
        }catch(e){
            console.log("whaterevetrea")
        }
        await sleep()
    }

})()