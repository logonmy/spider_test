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

let  hrefToJson = (str) => {
    let json = {};
    let arr = str.split("?")[1].split("&");
    for(let part of arr){
        json[part.split("=")[0]] = part.split("=")[1];
    }
    return json;
}
var a = "https://weibo.com/u/2718604160?profile_ftype=1&is_ori=1#_0"
console.log(hrefToJson(a))

let findInHref = (key, str) => {
    let  hrefToJson = (str) => {
        let json = {};
        let arr = str.split("?")[1].split("&");
        for(let part of arr){
            json[part.split("=")[0]] = part.split("=")[1];
        }
        return json;
    }
    let json = hrefToJson(str);
    for(let keyWord in json){
        if(keyWord === key){
            return json[keyWord];
        }
    }
    return null;
}

var a = "https://weibo.com/u/2718604160?profile_ftype=1&is_ori=1#_0";
var b = "is_ori";

findInHref(b, a)