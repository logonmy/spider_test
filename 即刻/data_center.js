var bee = require("./bee");
var Q = require("q");
var httpTask = require("../utils/httptask");
var beeUtil = require("../utils/beeUtils");
var db = require("./db");

var JIKE_LIST = "jike_list";
var JIKE_COMMENT = "jike_comment";
var JIKE_LIST_FILTER = "yang_jike_list";
var JIKE_COMMENT_FILTER = "yang_jike_comment";

function addList(topic) {
    function canGoNext(r) {
        if (r.length == 0) {
            return false;
        }
        var defer = Q.defer();
        beeUtil.getUniqueList(JIKE_LIST_FILTER, "id", r, function (back) {
            if(back.length == 0) {
                defer.reject();
            } else {
                defer.resolve(back);
            }
        });
        return defer.promise;
    }
    return bee.searchForTopic(topic).then(function (r) {
        return bee.findList(r.id, canGoNext);
    }, function (e) {
        console.log("没有匹配");
    }).then(function (list) {
        if (list.length == 0) {
            console.log("yang +++ no list to push to mongo");
            return;
        }
        console.log("push to mongo:");
        return db.insertMany(JIKE_LIST, list).then(function (r) {
        }, function (e) {
            console.log(e);
        });
    });
}

function updateList(topicId, loadMore) {
    console.log(topicId + " 开始检查更新");
    function canGoNext(r) {
        if (r.length == 0) {
            return false;
        }
        var defer = Q.defer();
        beeUtil.getUniqueList(JIKE_LIST_FILTER, "id", r, function (list) {
            if(list.length == 0) {
                defer.reject();
            } else {
                defer.resolve(list);
            }
        });
        return defer.promise;
    }
    return bee.findList(topicId, canGoNext).then(function (list) {
        if (list.length == 0) {
            console.log(topicId + " 暂无更新");
            return;
        }
        console.log("push to mongo:");
        return db.insertMany(JIKE_LIST, list).then(function (r) {
            var length = r.insertedIds.length;
            console.log(topicId + " 更新了 " + length +" 条");
            return length;
        }, function (e) {
            console.log(e);
        });
    });
}

function addComment(messageId) {
    function canGoNext(r) {
        if (r.length == 0) {
            return false;
        }
        var defer = Q.defer();
        db.insertMany(JIKE_COMMENT, r);
        defer.resolve(r);
        // beeUtil.getUniqueList(JIKE_COMMENT_FILTER, "commentId", r, function (back) {
        //     if(back.length == 0) {
        //         defer.reject();
        //     } else {
        //         db.insertMany(JIKE_COMMENT, back);
        //         defer.resolve(back);
        //     }
        // });
        return defer.promise;
    }
    return bee.findComment(messageId, canGoNext);
}

function getAllTopics() {
    var defer = Q.defer();
    db.waitForDbInitDone().then(function () {
        db.findAllTopics(JIKE_LIST).toArray(function (e, a) {
            defer.resolve(a);
        })
    });
    return defer.promise;
}

function getTopicLastsInHistory(tpicId) {
    var defer = Q.defer();
    db.waitForDbInitDone().then(function (mDb) {
        var obj = {
            "topic.id":tpicId,
            lego_output_time: {$exists : true}

        };
        mDb.collection(JIKE_LIST).find(obj).sort({"createdAt" : -1}).limit(200).toArray(function (mongoError, a) {
            defer.resolve(a);
        });
    });
    return defer.promise;
}

function getTopicLastInUpdate(topicId) {
    var defer = Q.defer();
    db.waitForDbInitDone().then(function (mDb) {
        var obj = {
            "topic.id":topicId,
            lego_output_time: {$exists : false}

        };
        mDb.collection(JIKE_LIST).find(obj).sort({"wa_create_time" : -1}).limit(1).toArray(function (mongoError, a) {
            defer.resolve(a);
        });
    });
    return defer.promise;
}

module.exports.getAllTopics = getAllTopics;
module.exports.addComment = addComment;
module.exports.addList = addList;
module.exports.updateList = updateList;
module.exports.getTopicLastsInHistory = getTopicLastsInHistory;
module.exports.getTopicLastInUpdate = getTopicLastInUpdate;

