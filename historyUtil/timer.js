const http = require('http')
const url = require('url')
const Http = require("../nodePart/api/http").Http

const source = [{"name": "微信公众号_3DM游戏网", "brick_id": 16761},
    {"name": "微信公众号_1862游戏", "brick_id": 16748},
    {"name": "微信公众号_游戏研究社", "brick_id": 16674},
    {"name": "微信公众号_动漫异次元", "brick_id": 16663},
    {"name": "微信公众号_幸运石动漫", "brick_id": 16662},
    {"name": "微信公众号_动漫头条", "brick_id": 16660},
    {"name": "微信公众号_蓝猫动漫", "brick_id": 16658},
    {"name": "微信公众号_动漫基地", "brick_id": 16657},
    {"name": "微信公众号_动漫大全", "brick_id": 16655},
    {"name": "微信公众号_ACG资讯", "brick_id": 16654},
    {"name": "微信公众号_ACG宅腐萌", "brick_id": 16653},
    {"name": "微信公众号_ACG次元饭", "brick_id": 16652},
    {"name": "微信公众号_二次元基地", "brick_id": 16651},
    {"name": "微信公众号_二次元理性蒸发", "brick_id": 16650},
    {"name": "微信公众号_二次元宅腐基", "brick_id": 16649},
    {"name": "微信公众号_二次元之梦", "brick_id": 16244},
    {"name": "微信公众号_晚安二次元", "brick_id": 16243},
    {"name": "微信公众号_二次元动漫", "brick_id": 16236},
    {"name": "微信公众号_爱上二次元", "brick_id": 16235},
    {"name": "微信公众号_二次元风暴", "brick_id": 16234},
    {"name": "微信公众号_二次元内外", "brick_id": 16229},
    {"name": "微信公众号_二次元头条", "brick_id": 16223},
    {"name": "微信公众号_偶的二次元世界", "brick_id": 16222},
    {"name": "微信公众号_二次元宅姬送", "brick_id": 16221},
    {"name": "微信公众号_东京二次元", "brick_id": 16220},
    {"name": "微信公众号_NaJoy二次元", "brick_id": 16219},
    {"name": "微信公众号_二次元催生办", "brick_id": 16218},
    {"name": "即刻_微信新动向", "brick_id": 16179}]
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
            console.log(content)

            try {
                await push(content);
            } catch (e) {
                console.log(e)
                console.log("发布任务时报错了");
            }
            await sleep(10)
        }
        await sleep(20 * 60);
    }
})()