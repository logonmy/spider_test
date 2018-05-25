const fetch = require("node-fetch");
const safeFetch = async (url, moreArgs = {}) => {
    try {
        return await fetch(url, moreArgs);
    } catch (e) {
        console.error(e);
    }
};
let cookie = "install_id=32783317434; odin_tt=d625455c8b6a451775dbea3e33936cfcf216f7398acade6f5a5cdbdfb68d319028cdabf5cd515491fb9494093b0f11b9; sessionid=15a4209093869058059e737e5b559215; sid_guard=15a4209093869058059e737e5b559215%7C1527149666%7C2591999%7CSat%2C+23-Jun-2018+08%3A14%3A25+GMT; sid_tt=15a4209093869058059e737e5b559215; ttreq=1$4e30f52d862e7b13e888ee4cf7743a97b8d29e5a; uid_tt=5ab50030688e5281630836a3765eeb60";
const getApi = async (url, moreArgs = {
    headers: {
        //"Cookie": cookie,
        'User-Agent': 'Aweme/1.8.2 (iPhone; iOS 11.3.1; Scale/3.00)',
        "Accept-Language": "zh-Hans-CN;q=1",
        "Accept-Encoding": "br, gzip, deflate",
        "Connection": "keep-alive",
        "Content-Type": "application/json"
    }
}) => {
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

(async () => {
    let keyword = encodeURIComponent("羊羊羊");

    let result = await getApi("https://aweme.snssdk.com/aweme/v1/general/search/?iid=32783317434&device_id=46880454170&os_api=18&app_name=aweme&channel=App%20Store&idfa=77F8565C-A670-4BAE-ACE8-427F267E0828&device_platform=iphone&build_number=18210&vid=B257D7AA-8B0B-4D24-86EB-BC673826FFF5&openudid=7bb27fbfb4aab1985cfb7e12e6b204a9c6521b40&device_type=iPhone10,3&app_version=1.8.2&version_code=1.8.2&os_version=11.3.1&screen_width=1125&aid=1128&ac=WIFI&count=12&keyword=" + keyword + "&offset=0&mas=004435fd7a825c51602e79b05a14536c6d6a59820d0030071bceb1&as=a11568d0e92c5b33162800&ts=1527153609");
    let uid = result.user_list[0].user_info.uid;

    result = await getApi("https://aweme.snssdk.com/aweme/v1/aweme/post/?iid=32783317434&device_id=46880454170&os_api=18&app_name=aweme&channel=App%20Store&idfa=77F8565C-A670-4BAE-ACE8-427F267E0828&device_platform=iphone&build_number=18210&vid=B257D7AA-8B0B-4D24-86EB-BC673826FFF5&openudid=7bb27fbfb4aab1985cfb7e12e6b204a9c6521b40&device_type=iPhone10,3&app_version=1.8.2&version_code=1.8.2&os_version=11.3.1&screen_width=1125&aid=1128&ac=WIFI&count=21&max_cursor=0&min_cursor=0&user_id=" + uid + "&mas=005084a6ac8e66cbc1b510952b1202f1daad6de3e78fffe5e4c8d1&as=a145c8d080725b19167160&ts=1527154976")
    let list = result.aweme_list;
    for (let li of list) {
        let awemeId = li.aweme_id;
        console.log(awemeId);
        console.log(li.video.play_addr.url_list[0]);
        console.log(li.desc);
        console.log(li.share_info.share_url);
        let comment = await getApi("https://aweme.snssdk.com/aweme/v1/comment/list/?iid=32783317434&device_id=46880454170&os_api=18&app_name=aweme&channel=App%20Store&idfa=77F8565C-A670-4BAE-ACE8-427F267E0828&device_platform=iphone&build_number=18210&vid=B257D7AA-8B0B-4D24-86EB-BC673826FFF5&openudid=7bb27fbfb4aab1985cfb7e12e6b204a9c6521b40&device_type=iPhone10,3&app_version=1.8.2&version_code=1.8.2&os_version=11.3.1&screen_width=1125&aid=1128&ac=WIFI&aweme_id=6558714910505700621&comment_style=2&count=20&cursor=0&digged_cid=&mas=0093e901dd8b2ff0f6342b8b0cf85d4d8b33cfb7bb49f2492e5721&as=a1b5a9c00c6f8b9e861199&ts=1527160572")
        let ccs = []
        for (let cc of comment.comments) {
            ccs.push(cc.text);
        }
        await sleep(2);
        console.log(ccs);
        console.log("#######################")
    }
})();