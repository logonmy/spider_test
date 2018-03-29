const sleep = (s=5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

(async () => {
    let i = 0
    while(true){
        await sleep(2);
        console.log("aaaaaaa",i)
        i++;
    }
})();

(async () => {
    let i = 0
    while(true){
        await sleep(2);
        console.log("bbbbb",i)
        i++;
    }
})()

//  证可行 所以对应每个异步函数 都有一个node东西出来