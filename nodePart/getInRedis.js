const RedisClient = require("./api/redis").RedisClient
const readLine = require("lei-stream").readLine;
const redis = new RedisClient({host: "127.0.0.1", port: 6379})


readLine("tett.txt").go(async(data, next) => {
    await redis.connect();
    data = JSON.parse(data);
    for(let message of data.messageIds){
        let re = await redis.sadd("jike_" + data.brick_id, message)
        console.log(re);
    }
    console.log("完成", data.brick_id);
    await redis.end();
    next();
})

