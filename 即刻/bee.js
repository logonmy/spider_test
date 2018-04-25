var httpTask = require("../utils/httptask");
var beeUtil = require("../utils/beeUtils");
var Q = require("q");

function checkForErr(result) {
    if (result == undefined) {
        return true;
    }

    if (result.indexOf("<") == 0) {
        return true;
    }
    try {
        var data = JSON.parse(result);
        return data.success;
    } catch (e) {
        console.log(" json 数据解析失败 \n" + result);
    }
    return true;

}

function requestTopicList(topic, loadMoreKey) {
    var history = {
        url: "https://app.jike.ruguoapp.com/1.0/users/messages/history",
        body: {
            topic: topic,
            loadMoreKey: loadMoreKey
        }
    };
    var defer = Q.defer();
    httpTask.post(history.url, JSON.stringify(history.body), function (r) {
        if (r == null) {
            defer.reject();
        } else {
            if (checkForErr(r)) {
                defer.reject();
                return;
            }
            defer.resolve(r);
        }
    });
    return defer.promise;
}

var findList = function (id, whetherNext, current) {
    var defer = Q.defer();
    var list = [];
    function next(id, loadMoreKey) {
        requestTopicList(id, loadMoreKey).then(function (r) {
            var result = JSON.parse(r);
            loadMoreKey = result.loadMoreKey;

            if (loadMoreKey == null || loadMoreKey == undefined) {
                console.log("find list done by null loadMorekey id : " + id + " \n result: \n" + JSON.stringify(result));
                defer.resolve(list);
                return
            }

            var data = result.data;
            if (whetherNext == undefined) {
                defer.resolve(data);
                return;
            }
            if (data.length == 0) {
                defer.resolve(list);
                return;
            }

            var check = whetherNext(data);
            if (typeof check == "boolean") {
                if (check) {
                    data.forEach(function (item) {
                        list.push(item);
                    });
                    setTimeout(function () {
                        console.log("next");
                        next(id, loadMoreKey);
                    }, 2000 + beeUtil.getRandomTime());
                } else {
                    defer.resolve(list);
                }
            } else {
                check.then(function (back) {
                    back.forEach(function (item) {
                        list.push(item);
                    });
                    setTimeout(function () {
                        console.log("next");
                        next(id, loadMoreKey);
                    }, 2000 + beeUtil.getRandomTime());
                }, function () {
                    defer.resolve(list);
                });
            }

        }, function (e) {
            setTimeout(function () {
                console.log("发生错误,正在重试 findList ----: \n" + id + " \n" + loadMoreKey);
                next(id, loadMoreKey);
            }, 2000 + beeUtil.getRandomTime());
        });
    }
    next(id, current);
    return defer.promise;
};

function requestComment(messageId, loadMoreKey) {
    var comments = {
        url: "https://app.jike.ruguoapp.com/1.0/messageComments/listPrimary",
        body: {
            messageId: messageId,
            loadMoreKey: loadMoreKey
        }
    };
    var defer = Q.defer();
    httpTask.post(comments.url, JSON.stringify(comments.body), function (r) {
        if (r == null) {
            defer.reject();
        } else {
            if (checkForErr(r)) {
                defer.reject();
                return;
            }
            defer.resolve(r);
        }
    });
    return defer.promise;
}

var findComment = function (id, whetherNext) {
    var defer = Q.defer();
    var list = [];
    function next(id, loadMoreKey) {
        requestComment(id, loadMoreKey).then(function (r) {
            console.log(r);
            var result;
            try {
                result = JSON.parse(r);
            } catch (e) {
                defer.reject(e);
                return;
            }

            if (result.success === false) {
                defer.reject("系统错误");
                return;
            }
            loadMoreKey = result.loadMoreKey;

            var data = result.data;
            if (whetherNext == undefined) {
                defer.resolve(data);
                return;
            }

            if (data.length == 0) {
                defer.resolve(list);
                return;
            }

            if (loadMoreKey == undefined) {
                var last = data[data.length - 1];
                loadMoreKey = {
                    commentId: last.commentId,
                    messageId: last.messageId,
                    createdAt: last.createdAt
                }
            }

            if (loadMoreKey == undefined) {
                defer.reject("空的loadMoreKey");
                return
            }

            var check = whetherNext(data);
            if (typeof check == "boolean") {
                if (check) {
                    next(id, loadMoreKey);
                } else {
                    defer.resolve(list);
                }
            } else {
                check.then(function (back) {
                    back.forEach(function (item) {
                        list.push(item);
                    });
                    next(id, loadMoreKey);
                }, function () {
                    defer.resolve(list);
                });
            }
        }, function (e) {
            setTimeout(function () {
                console.log("发生错误,正在重试 findComment----: \n" + id + " \n" + loadMoreKey + "\n " + e);
                next(id, loadMoreKey);
            }, 2000 + beeUtil.getRandomTime());
        });
    }
    next(id);
    return defer.promise;
};

function searchForTopic(topic) {
    var topicE = encodeURI(topic);

    return httpTask.get("https://app.jike.ruguoapp.com/1.0/search/integrate?keywords=" + topicE + "&skip=0").then(function (e) {
        try {
            var d = JSON.parse(e);
        } catch (e1) {
            console.log(e)
            return
        }
        if (d.success) {
            var data = d.data;
            var found;
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if ("TOPIC" === item.type) {
                    var items = item.items;
                    items.forEach(function (a) {
                        if (a.content === topic) {
                            found = a;
                        }
                    });
                }
            }
            if (found) {
                return found;
            } else {
                console.log("not found " + topic);
                return Q.reject("not found");
            }
        } else {
            console.log("search err " + e);
        }
    }, function (e) {
        console.log(e);
    });
}
module.exports.requestTopicList = requestTopicList;
module.exports.findList = findList;
module.exports.requestComment = requestComment;
module.exports.findComment = findComment;
module.exports.searchForTopic = searchForTopic;
