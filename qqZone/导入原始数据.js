const RedisClient = require("../nodePart/api/redis").RedisClient;
const redis = new RedisClient({host: "127.0.0.1", port: 6379});
const readLine = require("lei-stream").readLine;

let run = async () => {
// await redis.connect();
// await redis.sadd("qqZoneTask", "https://user.qzone.qq.com/2606118571");
// await redis.sadd("qqZoneTask", "https://user.qzone.qq.com/995865869");
// await redis.end();
}

let i = 0;
readLine("qqZoneTask.txt").go(async (data, next) => {
    i++;
    if(i < 16188){
        console.log(i)
    }else{
        console.log(i)
        await redis.connect();
        console.log(data);
        await redis.sadd("qqZoneTask", data);
        await redis.end();
    }

    next();
}, async () => {
    console.log("over");
})

