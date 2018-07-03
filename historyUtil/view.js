const RedisClient = require("../nodePart/api/redis").RedisClient;
const redis = new RedisClient({host: "127.0.0.1", port: 6379});




(async () => {
    let data =await popSet("qqZoneTestSet")
    console.log(data);
    await redis.connect();
    //await redis.sadd("qqZoneTestSet" ,2);
    let re = await redis.smembers("qqZoneTestSet");
    console.log(re);
    await redis.end();
})()

