// const RedisClient = require("../nodePart/api/redis").RedisClient;
// const redis = new RedisClient({host: "127.0.0.1", port: 6379});
//
//
//
//
// (async () => {
//     let data =await popSet("qqZoneTestSet")
//     console.log(data);
//     await redis.connect();
//     //await redis.sadd("qqZoneTestSet" ,2);
//     let re = await redis.smembers("qqZoneTestSet");
//     console.log(re);
//     await redis.end();
// })()

const events = require("events");

const fun1 = () => {
    console.log(1);
}

class c extends events {
    constructor(attr) {
        super();
        this.attr = attr;
    }

    func() {
        return (fn => {
            const gen = fn.call(this);
            return new Promise((resolve, reject) => {
                function step(key, args) {
                    let info, value;
                    try {
                        info = gen[key][arg];
                        value = info.value;
                    } catch (e) {
                        reject(e);
                        return;
                    }

                    if (info.done) {
                        resolve(value);
                    } else {
                        return new Promise.resolve(value).then(
                            value => {
                                step('next', value);
                            },
                            err => {
                                step('throw', err);
                            }
                        )
                    }
                }

                return step('next');
            })
        })(function* () {
            const error = (yield fun1());
            if (error) {
                throw new Error(error);
            }

        })
    }
}


// yield关键字可以让当前函数暂停执行并保存现场，并跳出到调用此函数的代码处继续执行。
// 可以利用函数执行时的返回句柄的next方法回到之前暂停处继续执行
// next执行的返回值的value即是yield关键字后面部分的表达式结果
// 下一个next的唯一参数值可以作为yield的整体返回值，并赋值给a变量
function* test(p) {
    console.log(p);
    var a = yield p + 1
    console.log(a);
}

// var gen = test(1);
// var res = gen.next();
// console.log(res);

// var template = (options = {}) => {
//     return (fn => {
//         const gen = fn.call(this);
//         return new Promise((resolve, reject) => {
//             function step(key, arg) {
//                 let info, value;
//                 try {
//                     info = gen[key](arg);
//                     value = info.value;
//                 } catch (error) {
//                     reject(error);
//                     return;
//                 }
//                 if (info.done) {
//                     resolve(value);
//                 } else {
//                     return Promise.resolve(value).then(
//                         value => {
//                             step('next', value);
//                         },
//                         err => {
//                             step('throw', err);
//                         });
//                 }
//             }
//
//             return step('next');
//         });
//     })(function* () {
//         var p = 1;
//         console.log(p);
//
//         var a = yield p + 1;
//         console.log(a);
//     });
// }
// template();

// view try
// const fun = () => {
//     let fun2 = () => {
//         try{
//             var a = sd.k;
//         }catch(e){
//             console.log(e, "fun1")
//         }
//
//     }
//     try{
//         fun2();
//     }catch(e){
//         console.log(e, "fun");
//     }
//
//     console.log("finish");
// }
// fun();