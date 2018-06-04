/**
 * Created by cqcpcqp on 2018/1/23.
 */
define(["../service/liteAjax"], function(liteAjax){
    var service = function(){
        this.get = function(url){
            var deferred = Q.defer();
            liteAjax(url, function(d){
                console.log(d)
                //if (JSON.parse(d).err_no == 0) {
                if(true){
                    deferred.resolve.apply(deferred, arguments)
                } else {
                    deferred.reject.apply(deferred, arguments)
                }
            },"GET")
            return deferred.promise;
        }

        this.post = function(url, postData){
            postData = postData || "";
            var deferred = Q.defer();
            liteAjax(url, function(d){
                if (true) {
                    deferred.resolve.apply(deferred, arguments)
                } else {
                    deferred.reject.apply(deferred, arguments)
                }
            },"POST", postData)
            return deferred.promise;
        }
    }
    return new service;
})