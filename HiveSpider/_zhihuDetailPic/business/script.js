let body = document.querySelector(".Mobile-body");
body.style.width = "375px";

function convertFileToDataURLviaFileReader(url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                resolve(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    })
}
let sleep = async (s = 10) => {
    return new Promise(resolve => { setTimeout(resolve, s * 1000) })
}
try {
    let button = document.querySelector(".Button.ContentItem-rightButton.Button--plain");
    button.click();
} catch (e) { }
try {
    document.querySelector(".Card.HotQuestions").remove();
} catch (e) { }

try {
    document.querySelector(".Card.ViewAllInappCard").remove();
} catch (e) { }
try {
    document.querySelector(".Card.Banner").remove();
} catch (e) { }
try {
    document.querySelector(".Card.RelatedReadings").remove();
} catch (e) { }
try {
    for (let i of document.querySelectorAll(".App-main button")) {
        try{
            i.remove();
        }catch(e){}
        
    }
    try{
        document.querySelector(".QuestionMainAction").remove()
    }
    catch(e){}
} catch (e) { }
const remove = () => {
    return (fn => {
        const gen = fn.call(this);
        return new Promise((resolve, reject) => {
            function step(key, args) {
                let info, value;
                try {
                    info = gen[key](arg);
                    value = info.value;
                } catch (e) {
                    reject(e);
                    return;
                }
                if (info.done) {
                    resolve(value);
                } else {
                    return new Promise.resolve(value).then(
                        value => {
                            step('next', value);
                        },
                        err => {
                            step("throw", err);
                        }
                    )
                }
            }
            return step("next");
        })
    })(function*(){

    })
}

(async () => {
    let run = true
    await sleep(5);
    let content = document.querySelector(".QuestionAnswer-content")
    let pics = content.querySelectorAll("img");
    console.log(pics.length, "要加载的图片数")
    let count = 0;
    for (let p of pics) {
        console.log(p.src);
        let newImage = new Image();
        newImage.src = p.src;
        newImage.onload = async () => {
            let dataUrl = await convertFileToDataURLviaFileReader(p.src);
            console.log(dataUrl)
            p.src = dataUrl;
            count++;
            if (count == pics.length) {
                if (run) {
                    run = false;
                    console.log("图片都加载完成");
                    let answer = document.querySelector(".App-main");
                    html2canvas(answer).then(function (canvas) {
                        document.body.appendChild(canvas);
                        Canvas2Image.saveAsPNG(canvas, canvas.width, canvas.height, "wocoa.png")
                    });
                }
            }
        }
    }
})()