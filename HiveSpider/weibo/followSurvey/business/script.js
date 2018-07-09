let hrefs = [];
setTimeout(function () {
    try {
        let pns = document.querySelectorAll(".person_num");
        for (let p of pns) {
            hrefs.push(p.querySelector("a").getAttribute("href"));
        }
        chrome.runtime.sendMessage(hrefs);
        window.close();
    } catch (e) {
        chrome.runtime.sendMessage(false);
    }
});