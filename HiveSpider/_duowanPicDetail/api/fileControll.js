define(["../service/liteAjaxPlus"], function(liteAjaxPlus){
    var filePath = 'http://file.api.jndroid.com/';
    var service = function(){
        this.write = function(name, postData) {
            return liteAjaxPlus.post(filePath + 'write?file='+ name +'.txt', postData)
        }

        this.read = function(name){
            return liteAjaxPlus.get(filePath + 'read?file='+ name + '.txt')
        }

        this.delete = function(name){
            return liteAjaxPlus.get(filePath + 'del?file='+ name + '.txt')
        }

        this.append = function(name, postData){
            return liteAjaxPlus.post(filePath + 'append?file='+ name + '.txt', postData)
        }

        this.init = function(name){
            var self = this,
                deferred = Q.defer();
            Q.all([self.delete(name), self.write(name)]).then(function(data) {
                deferred.resolve(data)
            }, function(error) {
                deferred.reject(error)
            });
            return deferred.promise
        }
    }
    return new service;
})