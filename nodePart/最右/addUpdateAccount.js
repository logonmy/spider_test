const RedisClient = require("../api/redis").RedisClient;
const redis = new RedisClient({host: "127.0.0.1", port: 6379});
const addLego = require("../api/lego").addLego;
const File = require("fs");

let data = {
    brick_id: void 0,
    name: void 0,
}

let run = async () => {
    if (!data.brick_id) {
        console.log("创建新的brick_id");
        let addBack = await addLego("最右_" + data.name, "最右_" + data.name + "的简介");
        addBack = JSON.parse(addBack);
        let name = "最右_" + data.name;
        while (addBack.err_no == -1) {
            name = name + "2";
            addBack = await addLego(name, "最右_" + data.name + "的简介");
            addBack = JSON.parse(addBack);
        }
        console.log(addBack);
        console.log("建立brick成功, brick_id为 ", addBack.result.id);
        data.brick_id = addBack.result.id;
    }


    await redis.connect();
    console.log(data)

    await redis.lpush("zuiyou_list", JSON.stringify(data));
    console.log("完成", data.brick_id);
    await redis.end();

    File.appendFileSync("zuiyou_brick.txt", JSON.stringify(data) + "\n");

}

run()