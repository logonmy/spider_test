define([], function(){
    var MessageBox = {
        tabs: [],
        addListener: function(){
            var self = this;
            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    for(var i=0;i< self.tabs.length;i++){
                        if(self.tabs[i].tabId === sender.tab.id){
                            if(request.false){
                                self.tabs[i].deferred.reject.call(self.tabs[i].deferred, request);
                            }else{
                                self.tabs[i].deferred.resolve.call(self.tabs[i].deferred, request);
                            }
                            self.tabs.splice(i, 1);
                            break;
                        }

                    }
                }
            )
        }
    }
    MessageBox.addListener();

    function Tab(url, script){
        this.url = url;
        this.script = script;
        this.MessageBox = MessageBox;
        this.deferred = Q.defer();
        this.tabId = void 0;
        this.selected = false;
    }

    Tab.prototype.participate = function(){
        var self = this;
        self.MessageBox.tabs.push({
            tabId: self.tabId,
            deferred: self.deferred
        });
    };

    Tab.prototype.run = function(){
        var self = this;
        try {
            chrome.tabs.create({url: this.url, selected: this.selected},function(tab){
                self.tabId = tab.id;
                self.participate();
                setTimeout(function () {
                    chrome.tabs.executeScript(tab.id, {
                        file: self.script[0]
                    });
                }, 1000)

            })
        }catch (e){
            console.log("chrome.tabs.create失败");
            self.run();
        }

        return this.deferred.promise;
    };
    return Tab;
})