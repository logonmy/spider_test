const RedisClient = require("./api/redis").RedisClient
const readLine = require("lei-stream").readLine;
const redis = new RedisClient({host: "127.0.0.1", port: 6379})


readLine("./最右/zuiyou_brick.txt").go(async(data, next) => {
    await redis.connect();
    data = JSON.parse(data);
    // for(let message of data.messageIds){
    //     let re = await redis.sadd("zuiyou_" + data.brick_id, message);
    //     console.log(re);
    // }

    //{"id":16433,"name":"最右_最右音乐台","created_at":1526384244480,"size":0}
    data.name = data.name.substr(3);
    let da = {
        brick_id: data.id,
        name: data.name
    }
    console.log(da)
    let re = await redis.lpush("zuiyou_list", JSON.stringify(da));
    console.log("完成", data.brick_id);
    await redis.end();
    next();
})

