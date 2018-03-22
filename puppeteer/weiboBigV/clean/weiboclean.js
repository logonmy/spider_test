const File = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");
const readLine = require("lei-stream").readLine;
const checkChinese = require("./utils").checkChinese;
const yesterdayTimestamp = require("./utils").yesterdayTimestamp;
const city = require("./utils").city;
const emoji = require("./utils").emoji;
const path = require("path")

String.prototype.replaceAll = function (searchValue, replaceValue) {
    return this.replace(new RegExp(searchValue, "gm"), replaceValue);
};

function replace(string, src, dst) {
    let index = string.indexOf(src);
    if (index < 0) {
        return string;
    }

    return string.substring(0, index) + dst + string.substring(index + src.length);
}

function replaceAll(string, src, dst) {
    while (true) {
        let result = replace(string, src, dst);
        if (result == string) {
            return result;
        }
        string = result;
    }
}

let map = {};

let line = 0;

// { a: 6332, i: 5760, br: 325, img: 4658, span: 1 }
let date = new Date();
let fileName = path.join(__dirname, "../data/" + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + ".txt");

let blogName = "";

let debug = false;

let historyMap = {};

let dereMap = {};

const run = async () => {
    console.log("weiboClean ING")
    let hisStr = File.readFileSync("./clean/history.txt");
    hisStr += "";
    let hisArr = hisStr.split("\n");
    for (let item of hisArr) {
        let json;
        try {
            json = JSON.parse(item);
        }
        catch (e) {
            continue;
        }
        historyMap[parseInt(json.mblogId)] = 1;
    }
    readLine(fileName).go((data, next) => {
        line++;
        if (line <= 0) {
            next();
            return;
        }
        let json = JSON.parse(data);
        if (dereMap[json.blogId]) {
            console.log("今日判重命中！");
            next();
            return;
        } else {
            dereMap[json.blogId] = 1;
        }
        if (historyMap[json.blogId]) {
            console.log("昨日已入库！");
            next();
            return;
        }

        /**如果包含展开全文，则过滤**/
        if (json.contentHTML.indexOf("展开全文") > 0) {
            next();
            return;
        }

        if (json.contentHTML.indexOf("ficon_cd_place") > 0) {
            next();
            return;
        }

        let contentHTML = "<div>" + json.contentHTML + "</div>";
        contentHTML = contentHTML.replaceAll("<br>", "\n");
        let mediaHTML = json.mediaHTML;
        let commentsHTML = json.commentsHTML;
        let infoHTML = "<div>" + json.infoHTML + "</div>";
        let d = new jsdom.JSDOM(contentHTML);
        let m = new jsdom.JSDOM(mediaHTML);
        let x = new jsdom.JSDOM(commentsHTML);
        let info = new jsdom.JSDOM(infoHTML);
        let content$ = jq(d.window);
        let media$ = jq(m.window);
        let info$ = jq(info.window);
        let comment$ = jq(x.window);

        if (parseInt(info$("a").attr("date")) < yesterdayTimestamp()) {
            console.log("两天以前的过滤!");
            next();
            return;
        }

        /**微博文字中的a标签多于1个必有妖孽，过滤**/
        let a = content$("a");
        if (a.length > 1) {
            next();
            return;
        }

        if (a.length == 1 &&
            (a.attr("href").indexOf("huati.weibo.com") >= 0
                || a.text().indexOf("@") >= 0)) {
            next();
            return;
        }

        /**i标签、span标签为微博徽章，过滤**/
        content$("div i").remove();
        content$("div span").remove();

        /**微博文字中img标签为表情，替换成[]占位符**/
        let img = content$("img");
        img.replaceWith(img.attr("title"));

        let obj = {};

        /**微博内容为话题讨论的直接过滤**/
        obj.C = content$(content$("div").contents()[0]).text().trim();
        if (obj.C.indexOf("____") >= 0) {
            next();
            return;
        }

        /**出现城市地名的直接过滤**/
        if (city(obj.C)) {
            next();
            return;
        }

        //add 添加过滤器
        //todo 去重
        let badWord = ["@",'＠',"http","qq","我是","本人","作为","最右","右友","右右","小右","友右","魏豪杰","知乎","纹身","文身","军队","星座","发帖","我上去","想上去","能上去","楼主","神评","楼下","要上去","顶上去","生日","评论","举爪","举个爪","举手","举个手","发言","集合","战队","请进","点赞","转转","标题","坐标","来自","骗赞","热评","右上角","骗进来","老规矩","报道","送上去","来晚","顶我","上的去","上得去","帖子","来迟","今天","赞我","即刻","即友","长按","http","路过","品玩","头像","网易","橘君","我姓","骗我","我都已经","橘子","桔子","小编","app","直播","预告","猜|","新浪","mono","猫弄","桔子君","橘子君","桔君","qq","留名","你好","早上好","广告","垃圾帖","特别鸣谢","表情包原图哥","小评","多玩","s娘","绿肥","网友","今日",'转载','贴吧','微信公众号','收藏','好奇心','微博','客服','公众号','链接','b站','b站','贩卖人口','下载','楼','违反','bilibili','助攻','哔哩哔哩','吸猫','打卡','求赞','com','33娘','段子','段友','点评','微商','早啊','早上好','晚上好','中午好','下午','凌晨','周末','今天','明天','上午','下午','后天','昨天','前天','233','求车','强行上头条','感谢分享','保存动图','什么时候上映','城会玩','求片面','求种子','找到资源','哪里能看','为什么看不了了','保存图片','求资源','标题党','原文地址','标题都不换','求种','沙发','小编','怎么没人评论','查看原图','外链','日报道','左上','左下','右上','右下','订阅','微信id','微信公众号地球知识局','加微信','留下微信','抵制','原图','爬梯','个人观点','勿撕','*','.cn','.com','www','进群','录制','加群','更新','�','up','搬运','激活码','断更','字幕组','制作','新人','免费送','招网兼','招兼职','微商代理','招代理','楼上','周一','周二','周三','周四','周五','周六','周日','周末','周更','不更','快更','拖更','断更','日更','月更','年更','上车','号码','加ID','投不了币','点个赞','硬币','抽奖','盗视频','你们放弃','催更','传上','过审','审核','投个币','交封','第三第三','顶点赛高','前排','抢个','第一第一','第二第二','首页','刷到','取关','关注','破译','斗鱼','后援','资源','少班主','百级','举报','粉丝','阿婆主','马甲','观看','芦萎','微信','想代','小伙伴可以','水友','分享','yy','YY','打钱','空降','中奖','密码','电话','扣扣','包邮','我这里','加个好友','加好友','某宝','代购','房间','骗了我','留下','领钱','群里','店铺','私信','ios码','安卓码','留个言','激活码','留言','内测','加我','娃娃','种子','已投','贴膜','团购群','求加','加ID','百度云','帐号','水友群','好友','加一下','办卡','欢迎','Q群','欢迎各位','伙伴群','群号','q群','屠龙宝刀','企鹅','群：','邀请码','抓娃娃','小号','大号','录播','投币','字幕','考古','2016','2017','2018','up','av','弹幕','播放','助攻','这期','一期','系列','哔哩哔哩','ht★tp','pan','网盘','正片','打卡','com','#','喜欢学姐','封面','[小电视_发愁]','咨询','水印','月份','刚毕业','日期','以下是','舍友','室友','点我','我爸','我妈','老图','水印','给我点赞','据报道','初中','高中','收藏','提点建议','快来发表你的观点吧','小时候','今年','明年','去年','过年','微博','吱口令','主题','谁','上传','早上','中午','晚上','题主','答主','赞个','赞一个','舍友','室友','点我','我爸','我妈','老图','水印','给我点赞','据报道','初中','高中','收藏','提点建议','快来发表你的观点吧','小时候','卤煮','大家是否','家里','老娘','一年级','二年级','三年级','四年级','五年级','六年级','我第一次','个吊','要我的话','微信','微商','我当年','转发','自动回复','微po','错别字','原来你','硬了一下','我一个男的','我一个女的','死刑','楼主','软广','我这里','我何时','我什么时候','魅族','魅蓝','就我一个人','我的妹妹','我的姐姐','我的妈妈','我的爸爸','我的弟弟','我的哥哥','我的叔叔','我的阿姨','我的爷爷','我的奶奶','我的外婆','我的外公','我的舅舅','我的舅妈','我的儿子','我的女儿','我的老爸','我的老妈','我的姥姥','我的姥爷','我的同学','我的同桌','█','&gt','催稿','答案','回复','层主','谢谢','新年快乐','回答','感谢','来早了','来晚了','占位','占个位置','淘宝','侵删','id','匿名','匿了',"宿舍","室友","寝室","输入法","帮忙","初中","高中","初一","初二","初三","高一","高二","高三","大一","大二","大三","大四","OPPO","VIVO","华为","小米","班级","这张图","___","一句话","说句话","军训","教官","发一张","处朋友","家人们","放假","说什么","上推荐","你会说","猜","教室","小冰","你怎么","在线等","上课","学校里","小哥哥","话题","看过来","哪个","觉得自己","哪位","顶一下","选一个","轻喷","福利","自家","大家","最右","友友","右友","小姐姐","指教","求大神","我家","有没有","学校","校运会","求大佬","求助","中秋","国庆","端午","清明","q友","祝福","夏天","暑假","哪些","哪种","哪一种",'番号','公告','周报','刚过','专栏','投稿','招聘','刘明','火钳','屏蔽','招募','抖音','emoji','明晚'];
        let badStatus = false;
        for(let badWordIndex = 0; badWordIndex < badWord.length; badWordIndex++){
            if(obj.C.indexOf(badWord[badWordIndex]) >= 0){
                console.log(badWord[badWordIndex])
                badStatus = true;
                break;
            }
        }
        console.log(badStatus)
        if(badStatus){
            next();
            return;
        }

        if (obj.C.indexOf("上半部分") >= 0 || obj.C.indexOf("下半部分") >= 0 ||
            obj.C.indexOf("上部分") >= 0 || obj.C.indexOf("下部分") >= 0 ||
            obj.C.indexOf("早安") >= 0 || obj.C.indexOf("午安") >= 0
            || obj.C.indexOf("晚安") >= 0 || obj.C.indexOf("早上好") >= 0
            || obj.C.indexOf("中午好") >= 0 || obj.C.indexOf("中午好") >= 0
            || obj.C.indexOf("晚上好") >= 0 || obj.C.indexOf("你") >= 0
            || obj.C.indexOf("明年") >= 0 || obj.C.indexOf("今年") >= 0 ||
            obj.C.indexOf("主页君") >= 0 || obj.C.indexOf("明晚") >= 0 ||
            obj.C.indexOf("今晚") >= 0 || obj.C.indexOf("明天") >= 0
            || obj.C.indexOf("昨天") >= 0 || obj.C.indexOf("昨晚") >= 0
            || obj.C.indexOf("新年") >= 0 || obj.C.indexOf("转发") >= 0
            || obj.C.indexOf("今天") >= 0 || obj.C.indexOf("微博") >= 0
            || (obj.C.indexOf("抽") >= 0 && obj.C.indexOf("奖") >= 0)
            || obj.C.indexOf("新浪") >= 0
            || (obj.C.indexOf("月") >= 0 && obj.C.indexOf("日") >= 0)
            || (obj.C.indexOf("网") >= 0 && obj.C.indexOf("盘") >= 0)
            || obj.C.indexOf("倒计时") >= 0 || obj.C.indexOf("白羊座") >= 0
            || obj.C.indexOf("金牛座") >= 0 || obj.C.indexOf("双子座") >= 0
            || obj.C.indexOf("巨蟹座") >= 0 || obj.C.indexOf("狮子座") >= 0
            || obj.C.indexOf("处女座") >= 0 || obj.C.indexOf("天秤座") >= 0
            || obj.C.indexOf("天蝎座") >= 0
            || obj.C.indexOf("天平座") >= 0 || obj.C.indexOf("摩羯座") >= 0
            || obj.C.indexOf("射手座") >= 0 || obj.C.indexOf("水瓶座") >= 0
            || obj.C.indexOf("双鱼座") >= 0 || obj.C.indexOf("今夜话题") >= 0
            || obj.C.indexOf("聊天室") >= 0 || obj.C.indexOf("今日") >= 0
            || obj.C.indexOf("品姐") >= 0) {
            next();
            return;
        }

        for (let key in emoji) {
            obj.C = replaceAll(obj.C, key, emoji[key]);
        }

        let reg = new RegExp('\\[(.+?)\\]', "g");

        obj.C = obj.C.replace("发布了头条文章：", "");
        obj.C = obj.C.replace(reg, "😂");
        obj.C = obj.C.replace("粉丝投稿：", "");

        if (obj.C.indexOf("——") > 0 && json.blogName === "英式没品笑话百科") {
            obj.C = obj.C.substr(0, obj.C.indexOf("——"));
        }

        if (obj.C.indexOf("【") === 0) {
            obj.C = obj.C.substr(obj.C.indexOf("】") + 1);
        }

        if (obj.C.indexOf("老照片：") === 0) {
            obj.C = obj.C.replace("老照片：", "");
            if (obj.C.indexOf("【") > 0) {
                obj.C = obj.C.substr(0, obj.C.indexOf("【"))
            }
        }

        if (obj.C.length < 10) {
            next();
            return;
        }

        let mblogTime = parseInt(info$("a").attr("date"));
        blogName = json.blogName;

        if (a.length === 1) {
            if (a.text().indexOf("秒拍视频") < 0 && a.text().indexOf("微博视频") < 0 && a.text().indexOf("网页链接") < 0) {
                obj = isCard(obj, media$, a, json.blogId, mblogTime);
            } else if (a.text().indexOf("网页链接") >= 0) {
                obj = isLink(obj, media$, a, json.blogId, mblogTime);
            } else {
                obj = isVideo(obj, media$, a, mblogTime);
            }
        } else {
            if (media$("ul.WB_media_a li img").length > 0) {
                obj = isPic(obj, media$);
            } else {
                /**纯文字内容舍弃**/
                if (obj.C.length < 20) {
                    next();
                    return
                }
                if (obj.C.indexOf("——") > 0) {
                    obj.C = obj.C.substr(0, obj.C.indexOf("——"));
                }

                if (obj.C.indexOf("--") > 0) {
                    obj.C = obj.C.substr(0, obj.C.indexOf("--"));
                }

                if (obj.C.indexOf("__") > 0) {
                    obj.C = obj.C.substr(0, obj.C.indexOf("__"));
                }

                if (obj.C[obj.C.length - 1] === ")") {
                    loop1(obj.C);

                    function loop1(str) {
                        str = str.substr(0, str.length - 1);
                        if (str[str.length - 1] !== "(") {
                            return loop1(str);
                        } else {
                            return str.substr(0, str.length - 1);
                        }
                    }
                }

                if (obj.C[obj.C.length - 1] === "）") {
                    loop2(obj.C);

                    function loop2(str) {
                        str = str.substr(0, str.length - 1);
                        if (str[str.length - 1] !== "（") {
                            return loop2(str);
                        } else {
                            return str.substr(0, str.length - 1);
                        }
                    }
                }

                obj.R = obj.C;
            }
        }
        if (!obj) {
            next();
            return
        }

        if (obj.C.length < 10) {
            next();
            return;
        }

        if (obj.R.indexOf("微博全景图片") >= 0) {
            next();
            return;
        }

        obj.T = JSON.stringify({blogName: blogName});
        obj.mblogId = json.blogId;
        obj.created_at = Date.now();
        //删除添加brick_id代码
        //obj.brick_id = brickId;

        let comments = handleComments(comment$);

        let comArr = [];

        let score = 0;
        for (let text in comments) {
            score++;
            let str = "";
            str = text.replace(reg, "😂");
            if (str.length > 140) {
                continue;
            }
            comArr.push({
                content: str,
                created_at: Date.now(),
                type: 1,
                score: 1 / score,
            })
        }
        if (comArr.length < 3) {
            next();
            return;
        }
        obj.C = JSON.stringify([obj.C]);

        let postData = {};
        postData.cr = obj;
        postData.comments = comArr;

        if (debug) {
            console.log(postData);
        } else {
            File.appendFileSync("./data/post.txt", JSON.stringify(postData) + "\n");
        }
        console.log(line);
        next();
    }, () => {
        File.writeFileSync("./clean/history.txt", "");
        readLine("./data/post.txt").go(async (data, next) => {
            line++;
            if (line <= 0) {
                next();
                return;
            }
            let json = JSON.parse(data);
            let cr = json.cr;
            cr.T = JSON.stringify({source: JSON.parse(cr.T).blogName, mblogId: cr.mblogId});
            File.appendFileSync("./clean/history.txt", cr.T + "\n");
            next();
        }, () => {
            console.log("history.txt更新完毕");
            process.exit(0);
        })
    })


};

/**处理图片类型**/
const isPic = (obj, media$) => {
    let title = obj.C;
    if (obj.C.indexOf("【") === 0) {
        title = obj.C.substr(obj.C.indexOf("【") + 1, obj.C.indexOf("】") - obj.C.indexOf("【") - 1)
    }
    if (title.length < 6) {
        title = obj.C;
    }
    obj.R = title;
    let data = media$("ul.WB_media_a").attr("action-data");
    let imgSrc = parseWBActionData(data, "clear_picSrc");
    let imgSrcArr = imgSrc.split(",");
    imgSrcArr = imgSrcArr.map(e => {
        return JSON.stringify({
            src: "http:" + e,
        });
    });
    obj.R += "||" + imgSrcArr.join("||");
    if (obj.C.indexOf("【") === 0 && obj.C.substr(obj.C.indexOf("】") + 1) !== ""
        && obj.C.substr(obj.C.indexOf("【") + 1, obj.C.indexOf("】") - obj.C.indexOf("【") - 1).length >= 6) {
        obj.R += "||" + obj.C.substr(obj.C.indexOf("】") + 1);
    }
    return obj;
};

/**处理视频类型**/
const isVideo = (obj, media$, a, time) => {
    if (!media$("div").html() || !media$("img").eq(0).attr("src")) {
        return false;
    }
    let coverImg = media$("img").eq(0).attr("src").indexOf("//") === 0 ?
        "http:" + media$("img").eq(0).attr("src") : media$("img").eq(0).attr("src");

    let title = obj.C;
    if (obj.C.indexOf("【") === 0) {
        title = obj.C.substr(obj.C.indexOf("【") + 1, obj.C.indexOf("】") - obj.C.indexOf("【") - 1)
    }
    if (title.length < 6) {
        title = obj.C;
    }
    obj.R = JSON.stringify({
        title: title,
        type: "web_url",
        source: a.attr("href"),
        cover_img: {
            src: coverImg
        },
        created_at: Date.now()
    });
    if (obj.C.indexOf("【") === 0 && obj.C.substr(obj.C.indexOf("】") + 1) !== "") {
        obj.R += "||" + obj.C.substr(obj.C.indexOf("】") + 1);
    }

    return obj;
};

/**处理链接类型**/
const isLink = (obj, media$, a, id, time) => {
    if (!media$("div").html()) {
        return false;
    }
    isCard(obj, media$, a, id, time);
};

/**处理卡片类型**/
const isCard = (obj, media$, a, id, time) => {
    let coverImg = "";
    if (!media$("img").eq(0).attr("src")) {
        coverImg = "http://image.jndroid.com/1510114908870_4301ea2e10ff659f01cb7e2fad1f4cf53f301eda"
    } else {
        coverImg = media$("img").eq(0).attr("src").indexOf("//") === 0 ?
            "http:" + media$("img").eq(0).attr("src") : media$("img").eq(0).attr("src");
    }
    obj.R = JSON.stringify({
        title: a.text(),
        tag: "微博",
        source: blogName,
        class: "weibo",
        name: "weibo",
        id: id,
        url: a.attr("href"),
        cover_img: {
            src: coverImg,
        }
        ,
        created_at: time
    });
    return obj;
};

/**处理评论**/
const handleComments = (comment$) => {
    let commentNodes = comment$("div.list_li");
    let comments = {};
    for (let node of commentNodes) {
        let face = comment$(node).find(".WB_text img");
        face.replaceWith(face.attr("title"));
        let str = comment$(node).find(".WB_text").eq(0).text().trim();
        if (str.indexOf("@") >= 0) {
            continue;
        }
        str = str.substr(str.indexOf("：") + 1);

        str = str.toLowerCase();

        if (city(str)) {
            continue;
        }

        if (str.indexOf("私") >= 0 || str.indexOf("赞") >= 0 || str.indexOf("互粉") >= 0
            || str.indexOf("资源") >= 0 || str.indexOf("主页") >= 0
            || str.indexOf("进来看") >= 0 || str.indexOf("点进来") >= 0
            || str.indexOf("楼主") >= 0 || str.indexOf("博主") >= 0
            || str.indexOf("评论配图") >= 0 || str.indexOf("图片评论") >= 0
            || str.indexOf("#") >= 0 || str.indexOf("转发微博") >= 0
            || str.indexOf("公众号") >= 0 || str.indexOf("学长") >= 0
            || str.indexOf("师姐") >= 0 || str.indexOf("微信") >= 0
            || str.indexOf("b好痒") >= 0 || str.indexOf("加我") >= 0
            || str.indexOf("水军") >= 0 || str.indexOf("微博") >= 0
            || str.indexOf("转发") >= 0 || str.indexOf("评论") >= 0
            || str.indexOf("找我") >= 0 || str.indexOf("网页链接") >= 0
            || (str.indexOf("网") >= 0 && str.indexOf("盘") >= 0)
            || str.indexOf("生日") >= 0 || str.indexOf("生快") >= 0
            || str.indexOf("mark") >= 0 || str.indexOf("马住") >= 0
            || str.indexOf("马克") >= 0 || str.indexOf("卖片") >= 0
            || (str.indexOf("你") >= 0 && str.indexOf("片") >= 0 && str.indexOf("反") >= 0)
            || (str.indexOf("你") >= 0 && str.indexOf("片") >= 0 && str.indexOf("思") >= 0)
            || str.indexOf("0回复") >= 0 || str.indexOf("零回复") >= 0
            || str.indexOf("自动回复") >= 0 || str.indexOf("营销号") >= 0
            || str.indexOf("红包") >= 0 || str.indexOf("粉丝") >= 0
            || str.indexOf("支付宝") >= 0 || str.indexOf("小编") >= 0
            || str.indexOf("观❤️影❤️️️") >= 0 || str.indexOf("网拍模特️️️") >= 0
            || str.indexOf("顶上去️️") >= 0 || str.indexOf("顶我上去") >= 0
            || str.indexOf("取关") >= 0 || str.indexOf("取消关注") >= 0
            || str.indexOf("❤️") >= 0 || str.indexOf("原po️") >= 0
            || str.indexOf("原po️") >= 0
        ) {
            continue;
        }

        if (comment$(node).find("div[node-type=comment_media_prev]").html()) {
            continue;
        }

        let likes = comment$(node).find("span[node-type=like_status] em").eq(1).text();
        if (likes == "赞") {
            likes = 0;
        }

        for (let key in emoji) {
            str = replaceAll(str, key, emoji[key]);
        }

        if (!checkChinese(str)) {
            continue;
        }

        if (!comment$(node).parent().parent().hasClass("list_box_in") && likes == 0) {
            continue;
        }

        comments[str] = likes;
    }
    return comments;
};

const parseWBActionData = (data, property) => {
    let dataArr = data.split("&");
    let res = "";
    for (let item of dataArr) {
        if (item.indexOf(property) == 0) {
            res = decodeURIComponent(item.replace(property + "=", ""));
            return res;
        }
    }
};

exports.weiboclean = run;