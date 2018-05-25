require([
    "config",
    "../api/http",
    "../api/async",
    "../api/task",
    "../api/socket",
    "../api/tab",
    "../api/fileControll"
], (Config, Http, Async, Task, Socket, Tab, File) => {

    let videoId = "ef7ee55f1a704d478fefe515caf58dd6";

    let url = "https://aweme.snssdk.com/aweme/v1/play/?video_id=" + videoId + "&line=0&ratio=720p&media_type=4&vr_type=0&test_cdn=None&improve_bitrate=0&iid=32783317434&device_id=46880454170&os_api=18&app_name=aweme&channel=App%20Store&idfa=77F8565C-A670-4BAE-ACE8-427F267E0828&device_platform=iphone&build_number=18210&vid=B257D7AA-8B0B-4D24-86EB-BC673826FFF5&openudid=7bb27fbfb4aab1985cfb7e12e6b204a9c6521b40&device_type=iPhone10%2C3&app_version=1.8.2&version_code=1.8.2&os_version=11.3.1&screen_width=1125&aid=1128&ac=WIFI";
    (async() => {
        let tab = new Tab(url, ["./business/script.js"]);
        let data = await tab.run();
        console.log(data);
    })();

});