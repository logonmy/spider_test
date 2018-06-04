define([], function () {
    let G = {
        tabId: void 0,
        script: void 0
    }

    var MessageBox = {
        tabs: [],
        addListener: function () {
            var self = this;

            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                if (changeInfo.status == 'complete' && tabId == G.tabId) {

                    function implantation(index) {
                        if (G.script[index].indexOf(".js") > -1) {
                            chrome.tabs.executeScript(G.tabId, {
                                file: G.script[index]
                            }, function () {
                                if (G.script[index + 1]) {
                                    implantation(index + 1);
                                }
                            })
                        } else {
                            chrome.tabs.executeScript(G.tabId, {
                                code: G.script[index]
                            }, function () {
                                if (G.script[index + 1]) {
                                    implantation(index + 1);
                                }
                            })
                        }
                    }

                    implantation(0);

                }
            });

            chrome.runtime.onMessage.addListener(
                function (request, sender, sendResponse) {
                    for (var i = 0; i < self.tabs.length; i++) {
                        if (self.tabs[i].tabId === sender.tab.id) {
                            if (request.false) {
                                self.tabs[i].deferred.reject.call(self.tabs[i].deferred, request);
                            } else {
                                self.tabs[i].deferred.resolve.call(self.tabs[i].deferred, request);
                            }
                            self.tabs.splice(i, 1);
                            break;
                        }

                    }
                }
            )
        },
    }
    MessageBox.addListener();

    function Tab(url, script) {
        this.url = url;
        this.script = script;
        this.MessageBox = MessageBox;
        this.deferred = Q.defer();
        this.tabId = void 0;
        this.selected = false;
    }

    Tab.prototype.participate = function () {
        var self = this;
        self.MessageBox.tabs.push({
            tabId: self.tabId,
            deferred: self.deferred
        });
    };

    Tab.prototype.run = function () {
        var self = this;
        chrome.tabs.create({url: this.url, selected: this.selected}, function (tab) {
            self.tabId = tab.id;
            self.participate();

            G.tabId = self.tabId;
            G.script = self.script;

        })
        return this.deferred.promise;
    };

    Tab.prototype.close = function () {
        chrome.tabs.remove(self.tabId, function () {

        })
    }

    return Tab;
})