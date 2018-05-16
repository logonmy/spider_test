const Http = require("../api/http").Http

const filePath = 'http://file.api.jndroid.com/';
let File = {};
File.write = (name, postData) => {
    return new Promise((resolve, reject) => {
        try{
            let re = Http.call(filePath + 'write?file=' + name + '.txt', postData)
            resolve(re);
        }catch (e){
            reject(e)
        }
    })
}
File.read = (name) => {
    return new Promise((resolve, reject) => {
        try{
            let re = Http.get(filePath + 'read?file=' + name + '.txt');
            resolve(re);
        }catch (e){
            reject(e)
        }
    })
}
File.append = function(name, postData){
    return new Promise((resolve, reject) => {
        try{
            let re = Http.call(filePath + 'append?file=' + name + '.txt', postData);
            resolve(re);
        }catch (e){
            reject(e)
        }
    })
}
exports.File = File;