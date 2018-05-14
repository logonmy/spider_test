
let fun2 = (aa) => {
    return new Promise((resolve, reject) => {
        aa ? reject("fun2 error"):resolve(true);
    })
}
let fun3 = (aa) => {
    return new Promise((resolve, reject) => {
        aa ? resolve(true) : reject("fun3 error");
    })
}


let fun  = (aa) => {
    return new Promise(async (resolve, reject) => {
        try{
            let cc = await fun3(aa);
            let bb = await fun2(aa);
            resolve(bb, cc);
        }catch(e){
            reject(e)
        }

    })
}

let run = async() => {
    // try{
    //     await fun(false);
    // }catch(e){
    //     console.log("应该报fun3 error");
    //     console.log(e)
    // }
    try{
        try{
            asd = das
            console.log(2)
        }catch(e){
            console.log("?")
            console.log(e)
        }
        console.log("runing")
    }catch(e){
        console.log(e)
    }
}

run()