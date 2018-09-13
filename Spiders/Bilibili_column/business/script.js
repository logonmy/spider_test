try{
    let title = document.querySelector("h1").innerText;
    let desc = document.querySelector(".lemma-summary").innerText;
    let img = document.querySelector(".summary-pic img").getAttribute("src")
    console.log({
        title,
        desc,
        img
    })
    chrome.runtime.sendMessage({
        title,
        desc,
        img
    })
    window.close()
}catch(e){
    let title 
    let desc
    let img
    desc = img = title = "error"
    chrome.runtime.sendMessage({
        title,
        desc,
        img
    })
    window.close()
}

