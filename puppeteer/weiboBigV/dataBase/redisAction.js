//丑陋
const redis = require("redis")

exports.redisAction = {
    client: void 0,
    start: () => {
        this.client = redis.createClient("6379", "127.0.0.1");
    },
    get: (keyName) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.get(keyName, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    set: (keyName, keyValue) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.set(keyName, keyValue, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    lpush: (listName, value) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.lpush(listName, value, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    rpush: (listName, value) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.rpush(listName, value, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    lpop: (listName) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.lpop(listName, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    rpop: (listName) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.rpop(listName, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    lrange: (listName) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.lrange(listName, 0, -1, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    del: (name) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.del(name, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    llen: (name) => {
        let self = this;
        return new Promise((resolve, reject) => {
            self.client.llen(name, function (error, res) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            })
        })
    },
    quit: () => {
        var self = this;
        self.client.quit();
    }
}
exports.dataBaseConfig = {
    toCrawlName: "list1",
    urlCacheName: "list2",
    urlSuccessName: "list3"
}