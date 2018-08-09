const fetch = require("node-fetch");
const File = require("fs");
const Queue = require("../api/queue").Queue;
const getApi = async (url, moreArgs = {
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36",
        "Connection": "keep-alive",
    }
}) => {
    const safeFetch = async (url, moreArgs = {}) => {
        try {
            return await fetch(url, moreArgs);
        } catch (e) {
            return false;
            console.error(e);
        }
    };
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.json();
    } else {
        return false;
    }
};
const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

const questionAll = async (qId) => {
    const getQuestion = async (qId, offset = 0, limit = 20) => {
        let timeout = setTimeout(() => {
            console.log("超时了5秒了呀 这个东西就应该丢弃掉了");
            process.exit();
        }, 5000);
        console.log(qId, offset, limit);
        const blockTime = 1;
        let href = "https://www.zhihu.com/api/v4/questions/" + qId
            + "/answers?include=data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp;data[*].mark_infos[*].url;data[*].author.follower_count,badge[?(type=best_answerer)].topics&offset=" +
            offset +
            "&limit=" +
            limit +
            "&sort_by=default";
        await sleep(blockTime);
        let re = await getApi(href);
        clearTimeout(timeout);
        return re;
    }
    let result = [];
    try {
        let offset = 0;
        let limit = 20;
        let re = await getQuestion(qId);
        result = result.concat(re.data);
        while (!re.paging.is_end) {
            offset += limit;
            re = await getQuestion(qId, offset, limit);
            result = result.concat(re.data);
        }
        console.log("该页面是成功的", qId);
        return result;
    } catch (e) {
        console.log(e);
        console.log("获取回答出错，不管他");
        return result;
    }

}
(async () => {
    while (true) {
        console.log("==========================");
        let i = await Queue.getDataFromMessage("zhihuquestionContent");

        i = i.result;
        let re = await questionAll(i);
        try {
            File.appendFileSync("result.txt", JSON.stringify(re) + "\n")
        } catch (e) {
            console.log(e);
            console.log("appendFile的时候出错了");
        }
        console.log(i);
        console.log("成功一个了")
        i = false;
    }
})();

