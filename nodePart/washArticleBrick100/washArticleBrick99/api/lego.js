define(["../service/liteAjaxPlus"], function (liteAjaxPlus) {
    var service = function () {
        
        this.putLego = async (data) => {
            let result = await liteAjaxPlus.call("http://chatbot.api.talkmoment.com/lego/library/lego/put", data)
            return result;
        }
        this.importLego = async (lego_id) => {
            let href = "http://chatbot.api.talkmoment.com/lego/engine/lego/import?id=" + lego_id
            let d = await liteAjaxPlus.get(href);
            return d;
        }
        this.getLego = async (lego_id) => {
            let result = await liteAjaxPlus.get("http://chatbot.api.talkmoment.com/lego/library/lego/get?id=" + lego_id);
            return JSON.parse(result).result;
        }
        this.getLegoUntil = async (brick_id, lego_id) => {
            let self = this;
            let datas = [];
            let result = await liteAjaxPlus.get("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id=" + brick_id + "&id_start=99999999&limit=100&version=002");
            result = JSON.parse(result);
            if (result.result.length == 0) {
                return [];
            }
            let count = 0;
            for (let i = 0; i < result.result.length; i++) {
                if (result.result[i].id <= lego_id) break;
                datas.push(result.result[i]);
                count++;
            }
            let length = result.result.length - 1;
            let id = result.result[length].id;
            while (count == 100) {
                try {
                    console.log("....loading");
                    let result = await self.getLegoBrickOne(brick_id, id);
                    result = JSON.parse(result);
        
                    length = result.result.length - 1;
                    id = result.result[length].id;
        
                    if (result.result.length == 0) {
                        break;
                    }
                    count = 0;
                    for (let i = 0; i < result.result.length; i++) {
                        if (result.result[i].id <= lego_id) break;
                        datas.push(result.result[i]);
                        count++;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            return datas;
        }
        this.getLegoBrickOne = async (brick_id, id) => {
            let result = await liteAjaxPlus.get("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id=" + brick_id + "&id_start=" + id + "&limit=100&version=002");
            return result;
        }
        this.readLegoFirst = async (brick_id) => {
            let result = await liteAjaxPlus.get("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id=" + brick_id + "&id_start=99999999&limit=1&version=002");
            return JSON.parse(result).result;
        }
        this.putLego = async (data) => {
            console.log(data, "putLego");
            let result = await liteAjaxPlus.post("http://chatbot.api.talkmoment.com/lego/library/lego/put", JSON.stringify(data))
            return result;
        }
        
        this.importLego = async (lego_id) => {
            let href = "http://chatbot.api.talkmoment.com/lego/engine/lego/import?id=" + lego_id
            let d = await liteAjaxPlus.get(href);
            return d;
        }
    }
    return new service;
})