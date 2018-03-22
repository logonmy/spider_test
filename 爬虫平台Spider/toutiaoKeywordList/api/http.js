define(["../service/liteAjax"], function(liteAjax){
    let Http = {};

    Http.request = (url, method, postBody) => {
        return new Promise((resolve) => {
            liteAjax(url, (data) => {
                return resolve(data)
            }, method, postBody);
        });
    };

    Http.call = (path, args) => {
        return new Promise((resolve, reject) => {
            let data = (args) ? JSON.stringify(args) : "";
            liteAjax(path, (data) => {
                try {
                    let res = JSON.parse(data);
                    if (res.err_no !== 0) throw new Error(res.stack.join("\n"));
                    return resolve(res.result);
                } catch(err) {
                    return reject(err);
                }
            }, "POST", data);
        });
    };

    return Http;
});