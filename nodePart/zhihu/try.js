const fetch = require("node-fetch");
const jsdom = require("jsdom");
const jq = require("jquery");
const File = require("fs");
const safeFetch = async (url, moreArgs = {}) => {
    try {
        return await fetch(url, moreArgs);
    } catch (e) {
        return false;
        console.error(e);
    }
};

const sleep = (s = 5) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

const getPage = async (url, moreArgs = {
    headers: {
        'Content-Type': 'charset=utf-8',
        "User-Agent": "Baiduspider-news",
        // "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36",
        "Connection": "keep-alive",
    }
}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.text();
    } else {
        return false;
    }
};

const getApi = async (url, moreArgs = {
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36",
        "Connection": "keep-alive",
    }
}) => {
    let res = await safeFetch(url, moreArgs);
    if (res !== undefined && res.status === 200) {
        return res.json();
    } else {
        return false;
    }
};

const userAll = async (userName) => {
    const getAllAnswers = async (userName) => {
        const blockTime = 4;
        const getAnswers = async (userName, offset = 0, limit = 20) => {
            // console.log("获取", userName, "的answer一次");
            let href = "https://www.zhihu.com/api/v4/members/" + userName + "/answers?include=data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,collapsed_by,suggest_edit,comment_count,can_comment,content,voteup_count,reshipment_settings,comment_permission,mark_infos,created_time,updated_time,review_info,question,excerpt,relationship.is_authorized,voting,is_author,is_thanked,is_nothelp;data[*].author.badge[?(type=best_answerer)].topics&offset=" +
                offset +
                "&limit=" + limit + "&sort_by=created";
            let re = await getApi(href);
            await sleep(blockTime)
            return re;
        }
        let result = []
        try {
            let offset = 0;
            let limit = 20;
            let re = await getAnswers(userName);
            result = result.concat(re.data);
            while (!re.paging.is_end) {
                offset += limit;
                re = await getAnswers(userName, offset, limit);
                result = result.concat(re.data);
            }
            return result;
        } catch (e) {
            console.log(e);
            console.log("获取回答出错，不管他");
            return result;
        }
    }
    const getAllQuestions = async (userName) => {
        const blockTime = 4;
        const getQuestion = async (userName, offset = 0, limit = 20) => {
            // console.log("获取", userName, "的question一次");
            let href = "https://www.zhihu.com/api/v4/members/" + userName + "/questions?include=data[*].created,answer_count,follower_count,author,admin_closed_comment&offset=" +
                offset +
                "&limit=" + limit;



            await sleep(blockTime);
            let re = await getApi(href);
            return re;
        }
        let result = [];
        try {
            let offset = 0;
            let limit = 20;
            let re = await getQuestion(userName);
            result = result.concat(re.data);
            while (!re.paging.is_end) {
                offset += limit;
                re = await getQuestion(userName, offset, limit);
                result = result.concat(re.data);
            }
            return result;
        } catch (e) {
            console.log(e);
            console.log("获取问题出错，不管他");
            return result;
        }

    }
    const getName = async (userName) => {
        // console.log("获取用户自己取的名字");
        try {
            let href = "https://www.zhihu.com/people/" + userName;
            let d = await getPage(href);
            d = new jsdom.JSDOM(d);
            let document = d.window.document;
            return document.querySelector(".ProfileHeader-name").innerText;
        } catch (e) {
            console.log(e);
            console.log("获得用户名出错了");
            return null;
        }
    }
    let userData = {};
    userData.id = userName;
    userData.name = await getName(userName);
    userData.answers = await getAllAnswers(userName);
    userData.questions = await getAllQuestions(userName);
    return userData;
}

const questionAll = async (qId) => {
    const getQuestion = async (qId, offset = 0, limit = 20) => {
        const blockTime = 1;
        let href = "https://www.zhihu.com/api/v4/questions/" + qId
            + "/answers?include=data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp;data[*].mark_infos[*].url;data[*].author.follower_count,badge[?(type=best_answerer)].topics&offset=" +
            offset +
            "&limit=" +
            limit +
            "&sort_by=default"
        await sleep(blockTime);
        let re = await getApi(href);
        return re;
    }

    //https://www.zhihu.com/api/v4/questions/284737507/answers?include=data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp;data[*].mark_infos[*].url;data[*].author.follower_count,badge[?(type=best_answerer)].topics&offset=0&limit=20&sort_by=default
    //https://www.zhihu.com/api/v4/questions/284737508/answers?include=data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp;data[*].mark_infos[*].url;data[*].author.follower_count,badge[?(type=best_answerer)].topics&limit=5&offset=5&sort_by=default"

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

    //往下走 和查询全部内容
    // let ht = await getPage("https://www.zhihu.com/people/bai-guo-shuai-12/answers");
    // let d = new jsdom.JSDOM(ht);
    // let document = d.window.document;
    // let lists = document.querySelectorAll(".List-item");
    // let answers = [];
    // for(let li of lists){
    //     answers.push({
    //         title: li.querySelector(".ContentItem-title [itemprop=name]meta").getAttribute("content"),
    //         href: li.querySelector(".ContentItem-title [itemprop=url]meta").getAttribute("content")
    //     })
    // }
    // console.log(answers);

    // let re = await getAllQuestions("li-xin-92-29");
    // for (let r of re) {
    //     File.appendFileSync("try.txt", JSON.stringify(r) + "\n");
    // }

    let testGuys = [
        "hua-si-lin",
        "zhou-wei-ji-15",
        "Annehua",
        "ha-bao-84",
        "yan-hua-72-27-24",
        "peterorbobby",
        "liu-ge-44-78",
        "xi-hua-44",
        "zhujunhua",
        "hua-xing-yi",
        "huanana",
        "wan-yi-hua-15",
        "PS1433",
        "cate9880",
        "hua-nong-lv",
        "hua-chen-yu-53-33",
        "mo-hua-78-45",
        "ying-chuan-hua",
        "hua-di-shuo",
        "hua-zi-xu-95",
        "luo-hua-50-30",
        "hua-yu-jun-55",
        "liao-xin-53-73",
        "luohanhua.haodf.com",
        "hua-zhi-jun-43",
        "yueyong",
        "hua-shao-kai",
        "hua-wei-ming-86",
        "hua-yan-chun",
        "yan-yan-15-3-56",
        "hua-er-zi-46",
        "hua-yu-yu-52-75",
        "hua-cheng-tao",
        "zhang-peng-peng-28",
        "hua-jun-hao",
        "hua-shuang-hun",
        "shi-lan-33-73",
        "li-zhi-hua-84",
        "hua-zheng-hao",
        "fu-qian-hua",
        "londbell",
        "yi-xiao-han-51",
        "li-di-hua-12-27",
        "hua-yun-feng-76",
        "hua-zhong-yi-36",
        "hua-li-qiao",
        "xiao-ze-ling-65",
        "hua-jia-wei",
        "hua-yi-yang",
        "le-da-90",
        "bigdatahd",
        "hua-wen-ting-37",
        "zhang-kai-hua-62",
        "gong-cheng-bu-hua-tong-xue",
        "hua-wei-zhe-57",
        "you-xia-er-67",
        "qin-guo-hua-89",
        "JokerIsGavin",
        "ms-hua",
        "fei-se-ying-hua",
        "hua-lai-shi-21",
        "hua-xian-ji-49",
        "hua-li-li-91",
        "li-zi-hua-62",
        "hua-cheng-fa-shuo",
        "hua-tian-ge-78",
        "hua-jiao-shou-26",
        "hua-bao-yu",
        "li-yong-hua-79",
        "hai-shui-18",
        "hua-hong-wei",
        "hua-er-zi-56",
        "hua-qi-lin-74",
        "sikongzhe",
        "yang-xi-hua",
        "ke-ai-de-xiao-jiu-jiu-45",
        "hua-xi-wa",
        "hua-ling-xun",
        "zhi-zhe-99-17",
        "jian-hua-15",
        "zhu-li-21-66",
        "hua-yu-hui",
        "hua-yi-wei-58",
        "guo-hua-si",
        "li-yan-hua-95",
        "hua-da-tong-99",
        "z-yn",
        "hua-you-hui-67",
        "huajiaji",
        "hua-niu-niu",
        "hua-zhi-sheng-4",
        "tonyhua",
        "hua-shi-yin",
        "zhu-bo-hua-lian-tong-wu-liu-xu-ge",
        "tang-zhi-hua-75-28",
        "hua-er-tong-2",
        "hua-tie-lu",
        "hua-hai-liang-1",
        "hua-kai-lun",
        "yiqie-qing-ling-38",
        "hua-wen-qiu",
        "kevinhua",
        "yi-yang-hua-56",
        "hua-lu-bin",
        "hua-bin-13",
        "syyjwh",
        "zhucan",
        "hua-zi-jie",
        "huali",
        "hua-er-69-40",
        "xuanxuan0_0",
        "hua-shu-yu-64",
        "fei-du-du-zuo-wei-meng",
        "hua-qia-qia-14-80",
        "hua-ping-fu-63",
        "daman520",
        "hua-kan-ru",
        "hua-hong-bing-37",
        "hua-xia-zi-sun-57",
        "quan-mei-hua",
        "lin-hai-hua-5",
        "hua-ruo-yu-53",
        "hua-jia-yi-34",
        "hua-yi-liu",
        "huan-lan-yan-de-hua-ke-xue-zi",
        "gan-jia-qi-80",
        "hua-luo-tang",
        "hua-hua-jun-54",
        "zhou-lin-qiao",
        "hua-xiao-yu-31-85",
        "hua-xin-yue-25",
        "Meganut",
        "hua-yi-qing-20",
        "hua-lai-shi-82",
        "hua-jun-jie-85",
        "hua-hua-hua-xi-wei",
        "huang-dong-lin-70",
        "hua-qi-qi-43",
        "hua-si-rui",
        "hua-he-xuan",
        "funhua",
        "ceng-yi-hua-42",
        "yqmjgf",
        "hua-si-yuan",
        "hua-yong-qi",
        "hua-zi-hao-57",
        "fayyuyu1",
        "hua-xian-zhen",
        "hua-yizhi-31",
        "ji-jiong-91",
        "qi-tian-3-38",
        "hua-zi-jian",
        "hua-yan-chuan",
        "mu-rong-hua-81",
        "liu-run-77",
        "hua-cang-lan",
        "hua-cha-cha-38",
        "bi-an-tian-man-tuo-luo-hua",
        "hele",
        "wang-zhen-kun-69",
        "hua-meng-meng-30",
        "cheng-cheng-60-56-19",
        "hua-a-hua-8",
        "hua-huan-li",
        "hua-tian-ya-99",
        "hua-ren-hua-39",
        "answay",
        "wu-chuan-hua",
        "112304",
        "hua-qi-hang",
        "shui-qing-mu-hua-68",
        "bo-wen-jing-56",
        "wang-wei-hua-89-77",
        "hua-xu-qiao",
        "hua-er-jie-40",
        "hua-jia-long",
        "hua-xian-sen",
        "hua-hua-4-62",
        "hua-yun-feng-42",
        "chen-si-hua-25",
        "hua-jun-feng-86",
        "hua-xiao-yang-78",
        "yinfengcaiye",
        "guo-shi-4-13",
        "hua-shu-hao",
        "hua-song-wei-47",
        "ou-yang-tian-hua-26",
        "huang-hai-hua",
        "qing_meng",
        "hua-qing-xin"
    ]

    console.log("开始时间", Date.now());
    for (let i = 0; i < testGuys.length; i++) {
        console.log("现在时间", Date.now());
        console.log("到底几个了", i);
        console.log(testGuys[i])
        let re = await userAll(testGuys[i]);
        File.appendFileSync("try.txt", JSON.stringify(re) + "\n");
    }
    console.log("结束时间", Date.now())
    // let i = 284734526;
    // while(i--){
    //     let re = await questionAll(i);
    //     try{
    //         File.appendFileSync("resiul.txt", JSON.stringify(re) + "\n")
    //     }catch(e){
    //         console.log(e);
    //         console.log("appendFile的时候出错了");
    //     }
    //     console.log(i);
    //     console.log("成功一个了")
    // }

})();

