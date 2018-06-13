const http = require('http')
const url = require('url')
const Http = require("../nodePart/api/http").Http;

const source = [
    {"name": "3DM游戏网", "brick_id": 16761},
    {"name": "1862游戏"},
    {"name": "游戏研究社"},
    {"name": "动漫异次元"},
    {"name": "幸运石动漫"},
    {"name": "动漫头条"},
    {"name": "蓝猫动漫"},
    {"name": "动漫基地"},
    {"name": "动漫大全"},
    {"name": "ACG资讯"},
    {"name": "ACG宅腐萌"},
    {"name": "ACG次元饭"},
    {"name": "二次元基地"},
    {"name": "二次元理性蒸发"},
    {"name": "二次元宅腐基"},
    {"name": "二次元之梦"},
    {"name": "晚安二次元"},
    {"name": "二次元动漫"},
    {"name": "爱上二次元"},
    {"name": "二次元风暴"},
    {"name": "二次元内外"},
    {"name": "二次元头条"},
    {"name": "偶的二次元世界"},
    {"name": "二次元宅姬送"},
    {"name": "东京二次元"},
    {"name": "NaJoy二次元"},
    {"name": "二次元催生办"},
    {"name":"木木宠物馆"},
    {"name":"青年文摘"},
    {"name":"全球逗比搞笑排行榜"},
    {"name":"囧囧搞笑笑话"},
    {"name":"万星人"},
    {"name":"笨鸟文摘"},
    {"name":"爆笑天涯"},
    {"name":"猫猫狗狗萌宠物"},
    {"name":"冷笑话精选"},
    {"name":"超级毁三观"},
    {"name":"戏精阿祖"},
    {"name":"奔波儿灞与灞波儿奔"},
    {"name":"来看新电影"},
    {"name":"唐唐频道"},
    {"name":"星座爱情"},
    {"name":"字媒体"},
    {"name":"搜狗哈哈"},
    {"name":"雷速体育"},
    {"name":"二丫陪你来唠嗑"},
    {"name":"捡书博士"},
    {"name":"最潮生活"},
    {"name":"BestList"},
    {"name":"逗爷来啦"},
    {"name":"不瘦不好受"},
    {"name":"好奇博士"},
    {"name":"文摇"},
    {"name":"Big磅来了"},
    {"name":"剧研社"},
    {"name":"全球娱乐志"},
    {"name":"扒爷说"},
    {"name":"娱乐独角兽"},
    {"name":"宛央女子"},
    {"name":"编剧帮"},
    {"name":"扒婆"},
    {"name":"QQ音乐"},
    {"name":"娱乐拆穿姐"},
    {"name":"FUN最现场"},
    {"name":"香港电影"},
    {"name":"鳗鲸的海"},
    {"name":"电影头条"},
    {"name":"达人钧钧工作室"},
    {"name":"影票贩子"},
    {"name":"MusicRadio音乐之声"},
    {"name":"FM93交通之声"},
    {"name":"婊哥"},
    {"name":"娱乐扒姬"},
    {"name":"娱乐圈扒姑"},
    {"name":"港剧剧评社"},
    {"name":"美美娱乐"},
    {"name":"深夜八卦"},
    {"name":"音乐有话说"},
    {"name":"扒圈者"},
    {"name":"姨太少女心"},
    {"name":"小鲜综艺"},
    {"name":"生活乐趣志"},
    {"name":"圈内大神"},
    {"name":"八卦先生"},
    {"name":"最最最韩流"},
    {"name":"传媒樱桃派"},
    {"name":"文娱商业观察"},
    {"name":"衣锦夜行的燕公子"},
    {"name":"不八卦会死星人"},
    {"name":"青春剧未央"},
    {"name":"娱乐圈蜀黍"},
    {"name":"有点儿内容"},
    {"name":"娱乐扒星客"},
    {"name":"逗萌社"},
    {"name":"娱乐硬糖"},
    {"name":"深八娱乐圈"},
    {"name":"聊点APP"}
    ]

const targetUrl = 'http://bee.api.talkmoment.com/scheduler/task/post'
const getBrickId = async () => {
    let getTrueName = () => {
        var date = new Date();
        var yyyy = date.getFullYear();
        var mm = date.getMonth() + 1;
        if (mm < 10) {
            mm = "0" + mm.toString();
        }
        var dd = date.getDate();
        if (dd < 10) {
            dd = "0" + dd.toString();
        }
        var name = yyyy + mm + dd + "更新";
        return name;
    }

    let trueName = getTrueName();

    let data = await Http.get("http://chatbot.api.talkmoment.com/lego/library/brick/list?limit=20&version=002");
    data = JSON.parse(data);
    data = data.result;
    for (let da of data) {
        if (da.name == trueName) {
            return da.id;
        }
    }

    return false;
}
const sleep = async (s = 5) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, s * 1000)
    })
}
let trueBrickId;

function push(postData) {
    return new Promise((resolve, reject) => {
        let urlObj = url.parse(targetUrl)
        let req = http.request({
            hostname: urlObj.hostname,
            path: urlObj.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }, res => {
            let html = '';
            let data = [];
            res.on('data', chunk => {
                data.push(chunk)
            })
            res.on('end', () => {
                html = Buffer.concat(data).toString();
                resolve();

            })
        }).setTimeout(8200, function () {
            console.log('超时')
            process.exit(0);
        });

        req.write(postData);
        req.end();
        req.on('error', (error) => {
            console.log(error);
            reject();
        })
    })

}

(async () => {
    while (true) {
        trueBrickId = await getBrickId();

        for (let sou of source) {
            let config = {
                num_item_limit: 10,
                brick_id: trueBrickId
            }
            config = JSON.stringify(config)
            let post_data = {
                name: 'wx_xingbang_list',
                value: sou.name,
                config,
                scheduled_at: new Date().getTime()
            };
            let content = JSON.stringify(post_data);
            console.log("数据组织出来是这样的", content);

            try {
                await push(content);
                console.log(new Date, "  上面那个content完成了")
                console.log("================");
            } catch (e) {
                console.log(e)
                console.log("发布任务时报错了");
            }
            await sleep(60)
        }
        await sleep(60 * 60);
    }
})()