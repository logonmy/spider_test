let getPageCount = (str) => {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        if (parseInt(str[i])) {
            result += str[i];
        }
    }
    return parseInt(result);
}
var a ="共 23 页";

getPageCount(a)
