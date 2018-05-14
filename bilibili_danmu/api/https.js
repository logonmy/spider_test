const http = require("https");
let Http = {};
const File = require("fs")

const timeout = 10000;

Http.call = async (path, args) => {
    let data = args || {};
    let postData = JSON.stringify(data);
    let options = {
        protocol: path.split(":")[0] + ":",
        host: path.split("//")[1].split("/")[0],
        //port: "3000",
        method: "POST",
        path: "/" + path.split("com/")[1],
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
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

        req.setTimeout(timeout, () => {
            reject("timeout")
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.write(postData);
        req.end();
    })
}
Http.get = async (path) => {
    let options = {
        protocol: path.split(":")[0] + ":",
        host: path.split("//")[1].split("/")[0],
        //port: "3000",
        method: "POST",
        path: "/" + path.split("com/")[1],
        headers: {
            "Origin": "https://www.bilibili.com",
            "User-Agent":" Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"
        }
    };
    return new Promise((resolve, reject) => {

        let req = http.request(options, (res) => {
            let data = "";
            res.setEncoding('utf-8');
            res.on("data", (chunk) => {
                console.log(chunk);
                File.appendFileSync("1.txt", chunk + "\n")
                data += chunk;
            })
            res.on("end", () => {
                //toXml(data)
                resolve(data);
            })
        })

        req.setTimeout(timeout, () => {
            reject("timeout")
        })

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.end();
    })
}

exports.Http = Http;