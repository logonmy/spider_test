const choices = [".article-content", ".rich_media_content", ".RichText.ztext.CopyrightRichText-richText"]



setTimeout(function () {
    try {
        for (let choice of choices) {
            if (document.querySelector(choice)) {
                let f = document.querySelector(choice).innerText.trim();
                f = f.split("\n");
                for (let fs of f) {
                    if (fs.length > 5) {
                        console.log(fs)
                        chrome.runtime.sendMessage(fs, function (response) { });
                        window.close()
                        break;
                    }
                }
                console.log(f)
                chrome.runtime.sendMessage(f, function (response) { });
                window.close()
            }
        }

        function getTag() {
            let spanL = document.querySelectorAll("span").length;
            let pL = document.querySelectorAll("p").length;
            if (pL > 30) {
                return "P"
            }
            let str = spanL > pL ? "SPAN" : "P";
            return "P";
        }
        var tag = getTag();
        var nodes = [];
        var classes = [];
        var body = document.querySelector("body");
        function getChildNode(node) {
            let nodeList = node.childNodes;
            for (let node of nodeList) {
                if (node.nodeType == 1) {
                    nodes.push(node)
                    getChildNode(node);
                }
            }
        }
        getChildNode(body);
        for (let node of nodes) {
            try {
                let cla = node.getAttribute("class");
                if (cla) {
                    classes.push(cla);
                }

            } catch (e) {
                console.log(e)
            }
        }
        var keys = ["content", "article", "detail", "Content", "text", "Text", "Rich"];
        var classesTemp = new Set();
        for (let cla of classes) {
            for (let k of keys) {
                if (cla.indexOf(k) > -1) {
                    classesTemp.add(cla);
                }
            }
        }
        classes = Array.from(classesTemp);
        console.log(classes)
        var maxParent;
        var maxCount = 0;
        for (let cla of classes) {
            cla = cla.split(" ");
            let text = "";
            for (let cl of cla) {
                cl = cl.trim();
                text = "." + cl;
            }

            let node = document.querySelector(text);
            if (node) {
                let count = 0;
                for (let c of node.childNodes) {
                    if (c.tagName == tag) {
                        count++;
                    }
                }
                if (count > maxCount) {
                    maxCount = count;
                    maxParent = node;
                }
            }
        }
        console.log(maxParent);
        var texts = maxParent.querySelectorAll(tag);
        var result = "";
        for (let text of texts) {
            text = text.innerText;
            if (text && text.length > 10) {
                result = text
                break;
            }
        }
        console.log(result)

        chrome.runtime.sendMessage(result, function (response) { });
        window.close();
    } catch (e) {
        console.log(e)
        chrome.runtime.sendMessage({
            error: e,
            data: "",
            url: window.location.href,
            false: true
        }, function (response) { });
        window.close();

    }
}, 4000)