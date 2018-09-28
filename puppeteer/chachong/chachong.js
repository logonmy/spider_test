const puppeteer = require('puppeteer');
const http = require("http")
const File = require("fs");
const fs = require("fs");
const jq = require("jquery");
const jsdom = require("jsdom");
const urlR = require('url');
const sendMail = require("./mail").sendMail;
const getNewFilePath = require("./file").getNewFilePath
const getFileName = require("./file").getFileName;
const Crypto = require("./Core/crypto");
const qiniu = require("qiniu")

const email = "intelplugcheker01@gmail.com"
const passwordT = "intel01"
const titleT = "Title"
const io = require("socket.io-client");
const socket = io("http://ws.api.talkmoment.com:51179");
let tasks = []


var companyAccessKey = 'gXjmrs0RzsZCgCgXyFeG4rJOFF7PeyRJoA5utl1F';
var companySecretKey = 'B0hqBH81VnWEZnY9VC_nikn9tfos89su0wbrJpDo';
const uploadImageWashu = async (buffer) => {
    let filename = "lunwen/" + Crypto.md5sum(buffer) + ".pdf";
    return new Promise((resolve, reject) => {
        let mac = new qiniu.auth.digest.Mac(companyAccessKey, companySecretKey);
        let options = {
            scope: 'upload:' + filename
        };
        let putPolicy = new qiniu.rs.PutPolicy(options);
        let uploadToken = putPolicy.uploadToken(mac);
        let config = new qiniu.conf.Config();
        config.zone = qiniu.zone.Zone_z0;
        let formUploader = new qiniu.form_up.FormUploader(config);
        let putExtra = new qiniu.form_up.PutExtra();
        formUploader.put(uploadToken, filename, buffer, putExtra, (err, respBody, respInfo) => {
            if (err) return reject(err);
            if (respInfo.statusCode != 200) return reject(new Error("upload failed, status = " + respInfo.statusCode + ", data = " + JSON.stringify(respBody)));
            let resUrl = respBody.key;
            return resolve(resUrl);
        });
    });
};


const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
};
const log = (str) => {
    let date = new Date();
    console.log(str + ">>>>>" + date);
};
let pages = [null, null];
const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        timeout: 0,
        devtools: false
    });
    log("启动浏览器成功");
    pages[1] = await browser.newPage();
    pages[0] = await browser.newPage();
    await pages[0].setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko)" +
        " Chrome/62.0.3202.75 Safari/537.36");
    await pages[0].setViewport({
        width: 1920,
        height: 1080,
        isLandscape: true
    });
    log("打开查重首页");
    try {
        await pages[0].goto('https://www.turnitin.com', {
            waitUntil: "domcontentloaded",
            timeout: 10000
        });
        console.log("成功打开首页")
    } catch (e) {
        console.log(e)
    }
    return;
};

const login = async () => {
    try {
        log("开始登录")
        await pages[0].waitForSelector(".app-links")
        await pages[0].evaluate(() => {
            let loginButton = document.querySelectorAll(".app-links a")[1];
            loginButton.click();
        })

        await pages[0].waitForSelector("#email");
        const userName = await pages[0].$("#email");
        await userName.click();
        await userName.type(email);

        await sleep(2)

        await pages[0].waitForSelector("#password");
        const password = await pages[0].$("#password");
        await password.click();
        await password.type(passwordT);

        const login = await pages[0].$("input[name=submit]");
        await login.click();
        log("点击login");
    } catch (e) {
        await login();
    }

}

const Assign = async () => {
    try {
        await pages[0].waitForSelector(".class_name a")
        const assign = await pages[0].$(".class_name a");
        await assign.click();
    } catch (e) {
        console.log(e, "assigning error");
        await sleep(1)
        await pages[0].reload();
        await Assign();
    }
}

const view = async () => {
    try {
        await pages[0].waitForSelector(".assgn-inbox a")
        const assign = await pages[0].$(".assgn-inbox a");
        await assign.click();
    } catch (e) {
        console.log(e, "viewing error");
        await sleep(1)
        await pages[0].reload();
        await view()
    }
}

const submit = async () => {
    try {
        await pages[0].waitForSelector(".matte_button")
        const submit = await pages[0].$(".matte_button");
        await submit.click();
    } catch (e) {
        console.log(e, "viewing error");
        await sleep(1)
        await pages[0].reload();
        await submit()
    }
}


const upload = async (localUrl) => {
    console.log("uploadUrl", localUrl);
    try {
        await pages[0].waitForSelector("#author_first", {
            timeout: 10000
        })
        await pages[0].waitForSelector("#author_last")
        await pages[0].waitForSelector("#title");

        const firstName = await pages[0].$("#author_first");
        await firstName.click();
        // for(let i = 0;i< 20;i++){
        //     await firstName.press("BackSpace");
        // }
        await firstName.type(email);

        const secondName = await pages[0].$("#author_last");
        await secondName.click();
        // for(let i = 0;i< 20;i++){
        //     await secondName.press("BackSpace");
        // }
        await secondName.type(email);

        const title = await pages[0].$("#title");
        await title.click();
        // for(let i = 0;i< 20;i++){
        //     await title.press("Backspace");
        // }
        await title.type(titleT);

        await pages[0].waitForSelector("#selected-file");
        await sleep(5);


        // select-file-clear

        // await pages[0].evaluate(() => {
        //     while(true){
        //         let unOk = document.querySelector(".btn.btn-primary.state-choose-file");
        //         if(!unOk){
        //             return;
        //         }
        //     }
        // })
        console.log("upload已经可以点击了");
        let upload = async () => {
            const fileInput = await pages[0].$("#selected-file");
            await fileInput.uploadFile(localUrl);
            console.log("成功upload");
            await sleep(5);
            await pages[0].waitForSelector("#upload-btn", {
                visible: true
            })
            console.log("找到了upload-btn")
            // disabled=disabled
            let sendButton = await pages[0].$("#upload-btn[disabled=disabled]");
            if (sendButton) {
                throw new Error("error")
            }
            sendButton = await pages[0].$("#upload-btn");
            await sendButton.click();
        }
        try {
            await upload(localUrl)
        } catch (e) {
            await upload(localUrl);
        }


    } catch (e) {
        console.log(e, "uploading error");
        await sleep(1)
        try {
            await pages[0].reload();

        } catch (e) { }
        await upload(localUrl);
    }
}

const confirm = async () => {
    await sleep(1);
    try {
        await pages[0].waitForSelector("#confirm-btn", {
            visible: true
        })
        let button = await pages[0].$("#confirm-btn");
        await button.click()
    } catch (e) {
        console.log(e, "confirming error");
        console.log(Date.now());
        await sleep(1)
    }
    try {
        await pages[0].waitForSelector("#close-btn", {
            timeout: 10000
        });
        let doc = await pages[0].$("#close-btn");
        await doc.click();
    } catch (e) {
        await confirm()
    }
}
const download = async () => {
    let outPage = null;
    return new Promise(async (resolve, reject) => {
        try {
            let l = await browser.pages()
            l = l.length;
            console.log(l)
            console.log("开始download");
            await pages[0].waitForSelector(".or-percentage");
            await pages[0].evaluate(() => {
                let as = document.querySelectorAll(".or-percentage");
                let a = as[as.length - 1];
                a.click();
            })
            let check = async () => {
                let newPages = await browser.pages();
                if (newPages.length === 3) {
                    await sleep(1);
                    await check();
                } else {
                    outPage = newPages[3];
                }
            }
            await check();

            let downnload = async () => {
                await outPage.waitForSelector("[title=Download]");
                let db = await outPage.$("[title=Download]");
                await db.click();

                await outPage.waitForSelector("[aria-label='Current View'] .label");
                db = await outPage.$("[aria-label='Current View'] .label");
                await db.click();
            }

            await downnload();
            setTimeout(async function () {
                await outPage.close();
                resolve();
            }, 15000)
            console.log("下载完成");
        } catch (e) {
            console.log("download 中的error'", e)
            if (outPage) {
                try {
                    await outPage.close()
                } catch (e) {

                }
            }
            await download();

        }
    })
}
const getResult = async () => {
    await pages[0].waitForSelector(".or-link");
    await sleep(2);
    let re = await pages[0].evaluate(() => {
        let ols = document.querySelectorAll(".or-link");
        let link = ols[ols.length - 1];
        let re = link.querySelector("span").innerText;
        let ss = document.querySelectorAll(".student--1");
        link = ss[ss.length - 1];
        return {
            re: re
        };
    })
    return re;
}

const uploadFile = async (filePath) => {
    let b = File.readFileSync(filePath);
    let re = await uploadImageWashu(b)
    re = "https://image.talkmoment.com/" + re;
    return re;
}

const downloadToLocal = async (task) => {
    console.log("开始下载", task);
    return new Promise((resolve, reject) => {
        const DOWNLOAD_DIR = "/Users/cqcpcqp/Downloads/d/lunwen";
        var download_file_httpget = function (file_url) {
            var options = {
                host: urlR.parse(file_url).host,
                port: 80,
                path: urlR.parse(file_url).pathname
            };

            var file_name = urlR.parse(file_url).pathname.split('/').pop();
            console.log(file_name, "fileName");
            var file = fs.createWriteStream(DOWNLOAD_DIR + '/' + file_name);
            http.get(options, function (res) {
                res.on('data', function (data) {
                    file.write(data);
                }).on('end', function () {
                    file.end();
                    resolve(DOWNLOAD_DIR + '/' + file_name);
                    console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
                });
            });
        };
        download_file_httpget(task)
    })
}

socket.on("message", (data) => {
    console.log(data);
    tasks.push({
        fileUrl: data.fileUrl,
        mailAddress: data.mailAddress,
        id: data.id
    })
});

(async () => {
    await launchBrowser();
    await login();
    console.log("完成login")
    await Assign();
    console.log("完成assign")
    await view();
    console.log("完成view")

    while (true) {
        try {
            await sleep(3);
            let task = tasks.shift();
            if (task) {
                console.log(task)
                let localUrl = await downloadToLocal(task.fileUrl);
                await submit();
                await upload(localUrl);
                await confirm();
                console.log("confirm 完成");
                let re = await getResult();
                let filePath = null;
                while (!filePath) {
                    await download()
                    console.log("下载pdf完成");
                    filePath = await getNewFilePath();
                }


                filePath = filePath.split(".crdownload")[0];
                console.log("本地的filepath", filePath)

                let fileName = getFileName(filePath)
                console.log("本地的filename", fileName);
                await sleep(5);
                setTimeout(function () {
                    try {
                        sendMail(fileName, task.mailAddress, re.re)
                        console.log("邮件发送成功");
                    } catch (e) {
                        console.log(e, "wahtever");
                        socket.emit("message", {
                            error_msg: "发送邮件失败请自行下载",
                            id: task.id
                        })
                    }
                }, 3000)
                console.log(re);
                let qiniuPath = await uploadFile(filePath);
                console.log("上传到七牛成功");
                File.appendFileSync("logssss.txt", JSON.stringify({
                    taskFileUrl: task.fileUrl,
                    taskMailAddress: task.mailAddress,
                    resultFileUrl: qiniuPath,
                    chong: re.re,
                    id: task.id
                }) + "\n")
                socket.emit("message", {
                    chong: re.re,
                    fileUrl: qiniuPath,
                    id: task.id
                })
            } else {
                console.log("暂时没有任务");
            }
        } catch (e) {
            console.log("总之 别死透了", e)
            socket.emit("message", {
                error_msg: "失败请重试",
                id: task.id
            })
        }
    }


    // while (true) {
    //     let fp = await getNewFilePath();
    //     console.log(fp, "f'")
    // }

})()