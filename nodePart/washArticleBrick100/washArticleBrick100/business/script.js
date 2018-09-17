setTimeout(function(){

    try{
        function getTag() {
            let spanL = document.querySelectorAll("span").length;
            let pL = document.querySelectorAll("p").length;
            if (pL > 30) {
                return "p"
            }
            let str = spanL > pL ? "span" : "p";
            return str;
        }
        var tag = getTag();
        var ps = document.querySelectorAll(tag);
        var maxParent;
        var maxLength = 0;
        for (var p of ps) {
            var parent = p.parentNode;
            var cps = parent.querySelectorAll(tag);
            var length = 0;
            for (var cp of cps) {
                var l = cp.innerText;
                if (l) {
                    length = length + l.length;
                }
            }
            if (length >= maxLength) {
                maxParent = parent;
                maxLength = length;
            }
        }
        console.log(maxParent)
        ps = maxParent.querySelectorAll(tag);
        var brief;
        for (var p of ps) {
            if (p.innerText && p.innerText.length > 3) {
                brief = p.innerText;
                break;
            }
        }
        console.log(brief);
        text = brief


        chrome.runtime.sendMessage(text, function (response) {});
        window.close();
    }catch(e){
        console.log(e)
        chrome.runtime.sendMessage({
            error:e,
            data: "",
            url: window.location.href,
            false: true
        }, function (response) {});
        window.close();
    }
}, 4000)