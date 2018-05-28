define(["../service/liteAjax"], function(liteAjax){
    var Queue = function(){

        this.postDataToMessage = function(queueName, data) {
            return new Promise((resolve, reject) => {
                liteAjax(`http://bee.api.talkmoment.com/message/publish?topic=${queueName}`,function(d){
                    resolve(d);
                }, "POST", data);
            })
        }

        this.getDataFromMessage = function(queueName){
            return new Promise((resolve, reject) => {
                liteAjax(`http://bee.api.talkmoment.com/message/subscribe/try?topic=${queueName}`, function(d){
                    d = JSON.parse(d);
                    resolve(d);
                }, "GET");
            })
        }

    }
    return new Queue();
})