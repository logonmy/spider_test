
//垃圾
const Queue = require("./api/queue").Queue;
const File = require("fs");
const http = require("https");

const queueName = "jikeToken"
const tokenCount = 5;
const phone = []

let file = {
	fileName: "tokenApplyLog.txt"
};
let out = false;
file.log = (str) => {
	let message = new Date() + str;
	File.appendFileSync(file.fileName, str + "\n");
	console.log(message)
}


let token,cookie,queueSize = 0;

let getAccount = (() => {
    let users = [{
        username: "13473666602",
        password: "Washu1234"
    }, {
        username: "15351702865",
        password: "cqcp815"
    }, {
        username: "18516179963",
        password: "Washu1234"
    }];
    return () => {
        let result = users.shift();
        users.push(result);
        return result;
    }
})();

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};

const httpPost = async (path, header, body) => {
    let data = body;
    let postData = JSON.stringify(data);
    let options = {
        protocol: path.split(":")[0] + ":",
        host: path.split("//")[1].split("/")[0],
        method: "POST",
        path: "/" + path.split("com/")[1],
        headers: header
    };
    return new Promise((resolve, reject) => {

        let req = http.request(options, (res) => {
            let data = "";
            res.setEncoding('utf-8');
            res.on("data", (chunk) => {
                data += chunk;
            })
            res.on("end", () => {
                resolve({
                    headers: res.headers,
                    data: data
                });
            })
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.write(postData);
        req.end();
    })}
const httpGet = async (path, header) => {
    if(!header){
        header = {
            "Content-Type":"application/json",
            "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        }
    }
    let options = {
        protocol: path.split(":")[0] + ":",
        hostname: path.split("//")[1].split("/")[0],
        method: "GET",
        path: "/" + path.split("com/")[1],
        headers: header
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, (res) => {
            let data = "";
            res.setEncoding('utf-8');
            res.on("data", (chunk) => {
                data += chunk;
            })
            res.on("end", () => {
                resolve(data);
            })
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })
        req.end();
    })}


const phoneLogin = async() => {
	console.log("phoneLogin");
    let moreArgs = {
        headers: {
            "Host":"app.jike.ruguoapp.com",
			"Accept":"*/*",
			"App-BuildNo":"1100",
			"App-Version":"4.3.2",
			"BundleID":"com.ruguoapp.jike",
			"OS":"ios",
			"Accept-Language":"zh-cn",
			"Accept-Encoding":"br, gzip, deflate",
			"Content-Type":"application/json",
			"Manufacturer":"Apple",
			"Content-Length":"76",
			"WifiConnected":"true",
			"User-Agent":"%E5%8D%B3%E5%88%BB/1100 CFNetwork/897.15 Darwin/17.5.0",
			"Connection":"keep-alive",
			"OS-Version":"Version 11.3 (Build 15E216)",
			"Model":"iPhone10,3",
        },
        body: {
            "areaCode":"+86",
            "password":"Washu1234",
            "mobilePhoneNumber":"13473666602"
        }
    }
    let result = await httpPost("https://app.jike.ruguoapp.com/1.0/users/loginWithPhoneAndPassword", moreArgs.headers, moreArgs.body);
    let cookie = "";
    for(let das of result.headers["set-cookie"]){
        cookie += das + ";";
    }
    console.log("cookie获取成功", cookie)
    return cookie;} 
const getUuid = async() => {
	console.log("getUuid")
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.create");
    console.log("uuid result", JSON.parse(result).uuid)
    return JSON.parse(result).uuid;}
const login = async(uuid) => {  
	console.log("login")
    let headers = {
        "Host":"app.jike.ruguoapp.com",
        "Content-Type":"application/json",
        "Origin":"https://ruguoapp.com",
        "Connection":"keep-alive",
        "Accept":"*/*",
        "User-Agent":"%E5%8D%B3%E5%88%BB/1100 CFNetwork/897.15 Darwin/17.5.0",
        "Referer":"https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language":"zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.login?uuid=" + uuid, headers);
    console.log("login result", result);
    return result;}
const confirm = async(uuid) => {  
	console.log("confirm");
    let headers = {
        "Host":"app.jike.ruguoapp.com",
        "Content-Type":"application/json",
        "Origin":"https://ruguoapp.com",
        "Connection":"keep-alive",
        "Accept":"*/*",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer":"https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language":"zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.confirm?uuid=" + uuid, headers);
    return result;}
const confirmation = async(uuid) => {  
	console.log("confirmation");
    let headers = {
        "Host":"app.jike.ruguoapp.com",
        "Content-Type":"application/json",
        "Origin":"https://ruguoapp.com",
        "Connection":"keep-alive",
        "Accept":"*/*",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile /sa-sdk-ios Jike/4.3.1",
        "Referer":"https://ruguoapp.com/account/scan?uuid=" + uuid,
        "Accept-Language":"zh-cn",
        "Cookie": cookie
    }
    let result = await httpGet("https://app.jike.ruguoapp.com/sessions.wait_for_confirmation?uuid=" + uuid, headers);
    return result;}
let getToken = async () => {
	console.log("getToken");
    let uuid = await getUuid();
    await sleep(1);
    if(JSON.parse(await login(uuid)).success){
        await sleep(1)
        if(JSON.parse(await confirm(uuid)).success){
            await sleep(1)
            if(JSON.parse(await confirmation(uuid)).token){
                console.log("token获取成功");
                return JSON.parse(await confirmation(uuid)).token
            }else{
                throw Error("confirmation 出错");
            }
        }else{
            throw Error("confirm 出错")
        }
    }else{
        throw Error("login 出错")
    }}   


let detect = async () => {
	let result = await Queue.detail(queueName, tokenCount + 1);
	result = result.result;
	queueSize = result.length;
	console.log(result);
	console.log(result[0]);
	if(result < 5 || JSON.parse(result[0]).created_at < new Date().getTime() - 300 * 1000){
		await update();
	}else{
		await sleep(5)
	}
	await detect();
}


let update = async () => {
	token = await getToken();
	let data = {
		token: token,
		created_at: new Date().getTime()
	}
	await Queue.postDataToMessage(queueName, data);
	if(queueSize > 0){
		await Queue.getDataFromMessage(queueName);
	}
}


(async ()=> {
    while(true){
        if(out){
            break;
        }
        await sleep(600 * 6 * 10);
        cookie = await phoneLogin();
        console.log(cookie)
    }
    
})();


let run = async () => {
	cookie = await phoneLogin();
	console.log("初始化cookie获取完毕", cookie);
	await detect();
}
run()




