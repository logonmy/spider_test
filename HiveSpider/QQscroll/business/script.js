var templateData = {
    items: []
}
setTimeout(function () {
    try {
        let as = document.querySelectorAll(".titMode li a");
        for (let a of as) {
            let url = a.getAttribute("href")
            let text = a.querySelector(".txt").innerText;
            let create_at = a.querySelector(".time").innerText;
            create_at = create_at.replace("月", "/");
            create_at = create_at.replace("日", " ");
            create_at = "2018/" + create_at;

            templateData.items.push({
                url: url,
                title: text,
                created_at: new Date(create_at).getTime()
            })
        }
        chrome.runtime.sendMessage(templateData, function (response) {
        });
        window.close();
    } catch (e) {
        console.log(e)
        chrome.runtime.sendMessage({
            error: e,
            data: templateData,
            url: window.location.href,
            false: true
        }, function (response) {
        });
        window.close();
    }
}, 5000)