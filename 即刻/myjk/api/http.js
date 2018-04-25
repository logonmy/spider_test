const http = require("http");
let Http = {};
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
            'Content-Type': 'application/json',
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

        req.on("error", (e) => {
            console.log(e);
            reject(e);
        })

        req.end();
    })
}

exports.Http = Http;