const readLine = require("lei-stream").readLine;

Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

function Type() { }
Object.defineProperty(Type, "TEXT", { value: 1 });
Object.defineProperty(Type, "IMAGE", { value: 2 });
Object.defineProperty(Type, "MULTI_IMAGE", { value: 3 });
Object.defineProperty(Type, "NEWS", { value: 4 });
Object.defineProperty(Type, "VIDEO", { value: 5 });
Object.defineProperty(Type, "QUIZ", { value: 6 });

function getTypeOfR(r) {
    var models = r2Models(r);
    return getTypeOfModels(models);
}

function getTypeOfModels(models) {
    if (hasTypeOfModels(models, Type.QUIZ)) {
        return Type.QUIZ;
    }
    if (hasTypeOfModels(models, Type.VIDEO)) {
        return Type.VIDEO;
    }
    if (hasTypeOfModels(models, Type.NEWS)) {
        return Type.NEWS;
    }
    if (hasTypeOfModels(models, Type.MULTI_IMAGE)) {
        return Type.MULTI_IMAGE;
    }
    if (hasTypeOfModels(models, Type.IMAGE)) {
        return Type.IMAGE;
    }
    return Type.TEXT;
}

function hasTypeOfModels(models, type) {
    for (var i = 0; i < models.length; i++) {
        var model = models[i];
        if (getTypeOfModel(model) == type) {
            return true;
        }
    }
    return false;
}

function getTypeOfModel(model) {
    if (model.type == "quiz") {
        return Type.QUIZ;
    }
    if (model.type == "video" || model.type == "web_url") {
        return Type.VIDEO;
    }
    if (model.url && model.source && model.title) {
        return Type.NEWS;
    }
    if (model.total && model.result) {
        return Type.MULTI_IMAGE;
    }
    if (model.src) {
        return Type.IMAGE;
    }
    return Type.TEXT;
}

function r2Models(r) {
    if (!r) {
        return null;
    }

    var groupModel = [];
    var hasVideo = false;

    response2ModelsInner(r);

    function response2ModelsInner(r) {
        if (r.trim() == "") {
            return;
        }

        if (r.indexOf("||") < 0) {
            if (r.indexOf("{") == 0 && r.lastIndexOf("}") == r.length - 1) {
                var rModel = JSON.parse(r);
                if (rModel.src === "") {

                } else if (rModel.text && rModel.src) {
                    // 表情
                    var imgModel = {};
                    imgModel.src = rModel.src;
                    imgModel.thumb = rModel.thumb;
                    imgModel.fmt = rModel.fmt;
                    groupModel.push(imgModel);
                } else {
                    if (hasVideo == false) {
                        if (rModel.type == "web_url" || rModel.type == "video") {
                            if (rModel.title) {
                                // 视频标题单独作为文字卡片
                                var tModel = {};
                                tModel.text = rModel.title;
                                groupModel.push(tModel);
                            }
                        }
                        groupModel.push(rModel);
                        if (rModel.imgs) {
                            var multiImageModel = {};
                            multiImageModel.total = rModel.imgs.length;
                            multiImageModel.result = rModel.imgs;
                            groupModel.push(multiImageModel);

                            delete rModel.imgs
                        }
                        hasVideo = true;
                    }
                }
            } else {
                var tModel = {};
                tModel.text = r;
                groupModel.push(tModel);
            }
            return;
        }

        var rFrames = r.split("||");
        var imgs = [];
        for (var i = 0; i < rFrames.length; i++) {
            var frame = rFrames[i];
            if (frame.indexOf("{") == 0) {
                var obj = JSON.parse(frame);
                if (obj.src && obj.type == undefined) {
                    var imgModel = {};
                    imgModel.src = obj.src;
                    imgModel.thumb = obj.thumb;
                    imgModel.fmt = obj.fmt;
                    imgs.push(imgModel);
                } else {
                    response2ModelsInner(frame);
                }
            } else {
                response2ModelsInner(frame);
            }
        }
        if (imgs.length > 1) {
            var multiImageModel = {};
            multiImageModel.total = imgs.length;
            multiImageModel.result = imgs;
            groupModel.push(multiImageModel);
        } else if (imgs.length == 1) {
            groupModel.push(imgModel);
        }
    }

    for (var i = 0; i < groupModel.length; i++) {
        var model = groupModel[i];
        if (getTypeOfModel(model) == Type.NEWS && model.cover_img == undefined) {
            for (var j = 0; j < groupModel.length; j++) {
                var m = groupModel[j];
                if (getTypeOfModel(m) == Type.IMAGE) {
                    model.cover_img = {};
                    model.cover_img.src = m.src;
                    groupModel.remove(m);
                    break;
                } else if (getTypeOfModel(m) == Type.MULTI_IMAGE) {
                    model.cover_img = {};
                    model.cover_img.src = m.result[0].src;
                    groupModel.remove(m);
                    break;
                }
            }
        }
    }

    return groupModel;
}

function models2R(models) {
    var rawString = "";
    for (var i = 0; i < models.length; i++) {
        var r = models[i];

        if (r.total) {
            for (var i = 0; i < r.result.length; i++) {
                var img = r.result[i];
                rawString += JSON.stringify(img) + "||";
            }
        } else {
            if (r.type == "web_url" || r.type == "video") {
                rawString += JSON.stringify(r) + "||";
            } else {
                if (r.src) {
                    rawString += JSON.stringify(r) + "||";
                } else if (r.text) {
                    rawString += r.text.trim() + "||";
                } else {
                    rawString += JSON.stringify(r) + "||";
                }
            }
        }
    }

    if (rawString.lastIndexOf("||") == rawString.length - 2) {
        rawString = rawString.substring(0, rawString.length - 2);
    }

    return rawString;
}

function getTextFromR(r) {
    var t = "";
    var frames = r.split("||");
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        if (frame.indexOf("{") < 0 && frame.indexOf("}") <= 0) {
            t += frame + " ";
        } else {
            try {
                var json = JSON.parse(frame);
                if (json.title) {
                    t += json.title;
                }
                if (json.question) {
                    t += json.question;
                }
            } catch (e) {

            }
        }
    }
    return t;
}

function getTextFromGroupModel(groupModel) {
    for (var i = 0; i < groupModel.length; i++) {
        var model = groupModel[i];
        if (model.question) {
            return model.question;
        }
        if (model.title) {
            return model.title;
        }
        if (model.text) {
            return model.text;
        }
    }
    return "";
}

function CardCoverter(session) {
    var self = this;

    var theme = session.theme;
    var models = [];
    if (theme.answer != "") {
        models = r2Models(theme.answer);

    }
    var videoCallback;
    var text = "";
    var imgs = [];

    var card = {};
    card.topic = session.topic;
    card.legoId = theme.lego_id;
    card.title = getTextFromR(theme.answer);
    card.type = getTypeOfModels(models);

    for (var i = 0; i < models.length; i++) {
        var model = models[i];
        var t = getTypeOfModel(model);
        if (t == Type.TEXT) {
            if (text !== "") {
                text += "\n";
            }
            text += model.text;
        } else if (t == Type.IMAGE) {
            var src = model.src;
            imgs = [src];

            loadImages();
        } else if (t == Type.MULTI_IMAGE) {
            for (var i = 0; i < model.result.length; i++) {
                var src = model.result[i].src;
                if (imgs.indexOf(src) < 0) {
                    imgs.push(src);
                }
            }

            loadImages();
        } else if (t == Type.VIDEO) {
            if (model.type !== "video") {
                extractVideoUrl(card.legoId, function (source) {
                    if (videoCallback) {
                        videoCallback(source);
                    }
                });
            } else {
                setTimeout(function () {
                    if (videoCallback) {
                        videoCallback(model.source);
                    }
                }, 1500)
            }

            if (model.cover_img) {
                var src = model.cover_img.src || model.cover_img.source;
                if (src) {
                    card.videoCover = src;
                    card.videoUrl = model.source;
                    card.playBtnShow = true;
                }
            } else {
                card.videoUrl = model.source;
            }
        } else if (t == Type.NEWS) {
            if (model.title.indexOf("《绝地求生》同时在线人数跌破200万") >= 0) {
                card.linkTitle = "";
            }
            card.linkTitle = model.title;
            if (model.cover_img && model.cover_img.src) {
                card.linkCover = model.cover_img.src;
            }
            card.link = model.url;

        }
    }

    if (text != "") {
        card.text = text;
    }
    card.allImages = imgs;

    if (card.link && !card.link_cover) {
        if (imgs.length > 0) {
            card.link_cover = imgs[0].src
        }
    }

    console.log(card)

    function loadImages() {
        while (imgs.length > 9) {
            imgs.pop();
        }

        if (imgs.length == 1) {
            card.src = imgs[0];
        } else if (imgs.length == 2) {
            card.src1 = imgs[0];
            card.src2 = imgs[1];
        } else {
            var images = [];
            for (var i = 0; i < imgs.length; i++) {
                var image = {};
                image.src = imgs[i];
                if (i % 3 == 2) {
                    image.marginRight = '0';
                } else {
                    image.marginRight = '4rpx';
                }
                images.push(image);
            }
            card.images = images;
        }
    }

    this.getCardModel = function () {
        return card;
    };

    this.setVideoCallback = function (c) {
        videoCallback = c;
    }
}
function convertTimestamp(t) {
    var d = new Date();
    var now = Date.now();
    var today = new Date(d.toLocaleDateString());

    if (now - t < 3600 * 1000) {
        return "刚刚";
    } else if (t > today.getTime()) {
        return "今天";
    } else if (t > today.getTime() - 86400000) {
        return "昨天";
    }

    d = new Date(t);
    var date = d.getDate();
    var month = d.getMonth() + 1;
    return month + "/" + date;
}
const init = async () => {
    let videos = [];
    return new Promise((resolve, reject) => {
        readLine("lego_100_0916.txt").go((data, next) => {
            try {
                data = JSON.parse(data);
                let t = getTypeOfR(data.R);
                if (t == 5) {
                    let model = r2Models(data.R)
                    let json;
                    for (let m of model) {
                        if (m.type) {
                            json = m
                        }
                    }
                    if (json.type == "web_url" || json.type == "video") {
                        videos.push(data);
                    }
                }
            } catch (e) {

            }
            next()
        }, () => {
            resolve(videos);
        });
    })
}


const http = require("http");

const checkOk = (path) => {
    let req;
    const get = (path) => {
        let options = {
            protocol: path.split(":")[0] + ":",
            host: path.split("//")[1].split("/")[0],
            //port: "3000",
            method: "GET",
            path: "/" + path.split("com/")[1],
            headers: {
                // 'Accept': '*/*',
                // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
            }
        };
        return new Promise((resolve, reject) => {
            req = http.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    console.log(data);
                    data += chunk;
                })
                res.on("end", () => {
                    console.log(data);
                    resolve(data);
                })
            })

            req.setTimeout(5000, () => {
                reject("timeout")
            })

            req.on("error", (e) => {
                console.log(e);
                reject(e);
            })

            req.end();
        })
    }
    return new Promise(async (resolve, reject) => {
        let re;
        let out = setTimeout(function () {
            if (req) {
                req.abort();
            }
            resolve(true)
        }, 2000)
        await get(path);
        if (re) {
            return;
        }
        clearTimeout(out);
        resolve(false);
    })

}


(async () => {
    // let videos = await init()
    // for (let v of videos) {
    //     let model = r2Models(v.R);
    //     for (let m of model) {
            
    //         if (m.type && m.type == "video") {
    //             console.log("-[--==-=-=-=-==-=-=-=-=-=-");
    //             // console.log(m)
    //             let ok = await checkOk(m.source)
    //             console.log(ok)
    //             if (!ok) {
    //                 console.log(m.source)
    //                 console.log(v)
    //             } else {
    //                 console.log(ok);
    //             }
    //         }
    //     }
    // }
    // console.log(videos);

    let ok = await checkOk("http://qnvideo.ixiaochuan.cn/zyvd/a7/ea/8f0d-59d0-11e8-97ab-00163e042306")
    console.log(ok)
})()