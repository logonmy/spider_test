var index = setInterval(function () {
    window.scrollTo(0, document.documentElement.scrollTop + 200);
}, 50);
let results = [];
let sleep = async (s = 10) => {
    return new Promise(resolve => {
        setTimeout(resolve, s * 1000)
    })
}
(async () => {
    try {
        while (true) {
            await sleep(2);
            console.log("nothing");
            let cards = document.querySelectorAll(".card-main")
            if (cards.length > 90) {
                for (let card of cards) {
                    let re = {
                        avatarUrl: "",
                        name: "",
                        desc: ""
                    }
                    re.avatarUrl = card.querySelector("img").getAttribute("src");
                    re.name = card.querySelector("h3").innerText;
                    re.desc = card.querySelector("h4").innerText;
                    console.log(re);
                    results = results.concat(re);
                }
                chrome.runtime.sendMessage(results, function (response) {
                });
                window.close();
            }
        }
    }
    catch (e) {
        console.log(e)
        chrome.runtime.sendMessage({
            error: e,
            data: TemplateData,
            url: window.location.href,
            false: true
        }, function (response) {
        });
        window.close();
    }
})()