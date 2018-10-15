const jsdom = require("jsdom");
const request = require("request");
const iconv = require("iconv-lite");
const Http = require("../../nodePart/api/http").Http;

let name = "海贼王";//"视频";////"手绘才是王道";////////"李毅";
let hrefT = "https://tieba.baidu.com/f?kw=" + encodeURIComponent(name);

// let task = Http.call('http://bee.api.talkmoment.com/scheduler/task/fetch?name=${}');


function Lego(href) {
    this.C = [];
    this.R = {};
    this.T = "{}";
    this.href = href || "";
    this.brick_id = 0;
    this.created_at = Date.now();
    this.comments = [];
}

const postLego = async (obj) => {
    obj.C = JSON.stringify(obj.C);
    obj.R = typeof obj.R === "string" ? obj.R : JSON.stringify(obj.R);
    return obj;
};

const getPage =  (href) => {
  return new Promise ((resolve,reject) => {
      request.get(href).pipe(iconv.decodeStream('utf-8').collect(function (err, body) {
          resolve(body);
      }))
  })
};


//TODO
//1.视频格式video
//2.图文格式
//3.链接

function washText(text){
    let deleteDiv = ["<img class=\"BDE_Smiley\"", "<div class=\"post_bubble" ];
    for(let del of deleteDiv){
        while (text.indexOf(del) !== -1){
            let str1 = text.substring(text.indexOf(del), text.length);
            text = text.substring(0, text.indexOf(del)) + str1.substring(str1.indexOf("\">") + 2, str1.length);
        }
    }

    while (text.indexOf("</div>") !== -1){
        text = text.replace("</div>","");
    }

    while (text.indexOf("<br>") !== -1){
        text = text.replace("<br>"," ");
    }

    text = text.trim();
    return text;
}






let runTieba = async (href ) => {
    let lego = new Lego(href);
    let html = await getPage(href);
    console.log("###"+href);
    let h = new jsdom.JSDOM(html);
    let doc = h.window.document;
    let title = "";
    if (doc.querySelector("h1")!== null){
        title = doc.querySelector("h1").getAttribute("title");
    }else if (doc.querySelector("h2") !== null){
        title = doc.querySelector("h2").getAttribute("title");
    }else if (doc.querySelector("h3") !== null){
        title = doc.querySelector("h3").getAttribute("title");
    }

    console.log(title);
    lego.C.push(title);

    let comments = [];
    let docs = doc.querySelectorAll(".d_post_content");
    if (docs !== null ){
        for (let doc of docs){
            if(doc.querySelector(".j_click_stats") !== null){
                continue;
            }
            let tex = washText(doc.innerHTML);
            while(tex.indexOf("<img class=\"BDE_Image") !== -1){
                let str2 = tex.substring(tex.indexOf("<img class=\"BDE_Image"), tex.length);
                tex = tex.substring(0,tex.indexOf("<img class=\"BDE_Image"))
                    + str2.substring(str2.indexOf("\">") + 2, str2.length);
            }
            if(tex !== "") {
                comments.push(tex);
            }
        }
        comments.shift();
    }
    lego.comments = comments;

    if(doc.querySelector(".d_post_content") !== null) {
        let firstContent = doc.querySelector(".d_post_content");
        let text = firstContent.innerHTML;
        let picList = [];
        if(firstContent.querySelectorAll("img") !== null){   //.pic + writer
            let pics = firstContent.querySelectorAll("img");
            for(let pic of  pics){
                let img = {};
                img.src = pic.getAttribute("src");
                img.width = pic.getAttribute("height");
                img.height = pic.getAttribute("width");
                picList.push(img);
            }


            text = washText(text);


            while(text.indexOf("<br>") !== -1 || text.indexOf("<img class=\"BDE_Image") !== -1){ //
                text = text.replace("<br>", "\n");
                if(text.indexOf("<img class=\"BDE_Image") !== -1){
                    let str2 = text.substring(text.indexOf("<img class=\"BDE_Image"), text.length);
                    let str3 = "";
                    if (text.indexOf("<img class=\"BDE_Image") > 12){
                        str3 = "||" ;
                    }
                    str3 += JSON.stringify(picList.shift());
                    text = text.substring(0,text.indexOf("<img class=\"BDE_Image"))
                        + str3 + str2.substring(str2.indexOf("\">") + 2, str2.length);
                }
            }
            lego.R = text;
            lego.T = JSON.stringify({
                state:"AUTO",
                type:"image",
                source:"tieba"
            });
        }


        lego.brick_id = 555;   //*****

    }

    return lego;
};


let runTiebaComments = async (href) => {
    let html = await getPage(href);
    let h = new jsdom.JSDOM(html);
    let doc = h.window.document;
    let comments = [];
    let docs = doc.querySelectorAll(".d_post_content");
    if (docs !== null ){
        for (let doc of docs){
            if(doc.querySelector(".j_click_stats") !== null){
                continue;
            }
            let tex = washText(doc.innerHTML);
            while(tex.indexOf("<img class=\"BDE_Image") !== -1){
                let str2 = tex.substring(tex.indexOf("<img class=\"BDE_Image"), tex.length);
                tex = tex.substring(0,tex.indexOf("<img class=\"BDE_Image"))
                    + str2.substring(str2.indexOf("\">") + 2, str2.length);
            }
            if(tex !== "") {
                comments.push(tex);
            }
        }
        comments.shift();
    }
    return comments;
};

async function main(){
    console.log(hrefT);
    let html = await  getPage(hrefT);
    let d = new jsdom.JSDOM(html);
    let document = d.window.document;
    let legoList = [];


    let divs = document.querySelectorAll(".t_con.cleafix");
    for (let div of divs ){
        let a = div.querySelector("a");
        let answer = div.querySelector(".threadlist_rep_num ").textContent;
        if(a.getAttribute("href").indexOf("p/") > 0 && parseInt(answer) > 5){
            let href = a.getAttribute("href");
            let lego ;
            if(div.querySelector(".threadlist_video") !== null){
                console.log("##video~");
                lego = new Lego("http://tieba.baidu.com"+href);
                let comments = runTiebaComments("http://tieba.baidu.com"+href);

                let title = a.getAttribute("title");
                lego.C.push(title);
                let img = {};
                let pic = div.querySelector(".threadlist_video").querySelector("img");
                img.src = pic.getAttribute("src");
                img.width = 0;
                img.height = 0;
                let video = div.querySelector(".threadlist_video").querySelector("a");
                lego.R.source = video.getAttribute("data-video");
                lego.R.type = "video";
                lego.R.cover_img = img;
                lego.T = JSON.stringify({
                    state:"AUTO",
                    type:"video",
                    source:"tieba"
                });
                lego.comments = comments;
            }else{
                console.log("##pic+writer");
                lego = await runTieba("http://tieba.baidu.com"+href);
            }
            legoList.push(lego);
        }
    }

    for(let leg of legoList){
        console.log(JSON.stringify(leg));
    }

    return legoList;
}

let list = main();

//测试代码
// console.log(runTieba("https://tieba.baidu.com/p/5913596268"));//"https://tieba.baidu.com/p/5913391512"));//("https://tieba.baidu.com/p/5906911643"));
//

// const takeTask = async () => {
//     let d = await Http.call()
// };

let postOne = async(k) => {   //发布任务
  const sendTaskUrl = "http://bee.api.talkmoment.com/scheduler/task/post";
  var as = ["tieba_"+hrefT,];

  for(let a of as){
      let postData = {
          name:a,
          value:k,
          config:JSON.stringify({
              brick_id:29620,
              publish:true
          }),
          scheduled_at:new Date().getTime()
      };
      console.log(postData);
      await Http.call(sendTaskUrl, postData);
  }
};
