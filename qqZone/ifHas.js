const RedisClient = require("../nodePart/api/redis").RedisClient;
const redis = new RedisClient({host: "127.0.0.1", port: 6379});

(async () => {

    await redis.connect();
    let re = await redis.sadd("qqZoneAlready", "http://user.qzone.qq.com/2456011283");
    console.log(re);
    await redis.end();

})()