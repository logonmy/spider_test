//更新处理 清空数据 写入新bolgList
const readLine = require("lei-stream").readLine;
const redisAction = require("../dataBase/redisAction").redisAction;
const dataBaseConfig = require("../dataBase/redisAction").dataBaseConfig;

//todo 如果是今日第一次运行 那么清空success库 通过本日文件是否存在 文本内是否含有数据判断

let init = async () => {
    let count = 0;
    let successUrl = true;
    let successArray = [];
    let successCount = 0;
    redisAction.start();
    while(successUrl){
        successUrl = await redisAction.lpop(dataBaseConfig.urlSuccessName)
        if(successUrl){
            successArray.push(successUrl);
        }
    }
    successCount = successArray.length;
    console.log("已经成功爬去条数", successCount);
    redisAction.quit();

    if(successCount === 0){
        console.log("从头开始");

        redisAction.start();
        while(await redisAction.lpop(dataBaseConfig.toCrawlName) != null){
            count++;
        }
        console.log("清空原始数据完成，共计删除条数", count);
        redisAction.quit();

        await readLine("./init/blogList.txt").go(async (data, next) => {
            redisAction.start();
            await redisAction.rpush(dataBaseConfig.toCrawlName, data);
            redisAction.quit();
            next();
        })
        console.log("原始数据导入成功(其实还在导入 是个异步的 跑在log后面了)")

    }else{
        console.log("从断点开始");

        redisAction.start();
        for(let i=0;i<successCount;i++){
            redisAction.rpush(dataBaseConfig.urlSuccessName, successArray[i]);
        }

        while(await redisAction.lpop(dataBaseConfig.toCrawlName) != null){
            count++;
        }
        console.log("清空原始完成，共计删除条数", count);
        redisAction.quit();


        console.log("successArray", successArray);
        await readLine("./init/blogList.txt").go(async (data, next) => {
            redisAction.start();
            if(successArray.every((x) => {return x != data})){
                await redisAction.rpush(dataBaseConfig.toCrawlName, data);
            }
            redisAction.quit();
            next();
        })
        console.log("原始数据导入成功(其实还在导入 是个异步的 跑在log后面了)")
    }
}

exports.init = init;
