spiders

extra bee from chrome/bee 

include all spiders on SpiderPlatform
include chrome/bee Template1.0 and Template2.0
include puppeteer solvation
include utils from 3.20-new Date()
include nodeServer for test write by express/jade


遗留问题

bilibili首页更新调试发现 : 去重未生效 相关 bilibiliVideoDetail/background.js
                                       _bilibili/background.js

1  所有的去重做的都不好 或者说不对 filterItem 那些
2  还有put那里逻辑还是没弄清楚
3  出现错误页(无效的url)的处理方式 与 爬取失败(爬虫代码错误导致)的处理方式相同 丢了一个error

4  最关键的问题 tab.js中的
        chrome.tabs.create({url: this.url, selected: this.selected},function(tab){
                    self.tabId = tab.id;
                    self.participate();
                    try{
                        for(var i =0;i<self.script.length;i++){
                            chrome.tabs.executeScript(tab.id, {
                                file: self.script[i]
                            });
                        }
                    }
                    catch(e){
                        console.log("execute失败了");
                        self.deferred.reject.call(self.deferred, e)
                    }
                })
        会报错unchecked runtime.lastError while running tabs.executeScript: The tab was closed.
   所以被迫要经常重启chrome
