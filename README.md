spiders

extra bee from chrome/bee 

include all spiders on SpiderPlatform
include chrome/bee Template1.0 and Template2.0
include puppeteer solvation
include utils from 3.20-new Date()
include nodeServer for test write by express/jade

historyUtil里面没用
puppeteer里面的 BIgV是每天跑的博主更新 环境需求 redis/各种包/chrome或chromium（路径在worker.js的execu..Path里）

遗留问题

bilibili首页更新调试发现 : 去重未生效 相关 bilibiliVideoDetail/background.js
                                       _bilibili/background.js

1  所有的去重做的都不好 或者说不对 filterItem 那些 待处理 所有都少了一个result.
2  还有put那里逻辑还是没弄清楚
3  出现错误页(无效的url)的处理方式 与 爬取失败(爬虫代码错误导致)的处理方式相同 丢了一个error

4   ////////////////////////////////
    问题1：
    tab.js中的
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
   样例： toutiaoUserList 无法给 搜索李开复的页面植入脚本

   已解决： 所有的类似问题 是在于 301了 页面自动跳转了 所以 植入不进去了 常出现情况 为http升级为https 易于解决 但莫名其妙的跳转的 等到以后遇到再处理
   ////////////////////////
   问题2：
   升级messageBox与tab 主要指 messageBox查询与tab中$q

5  未开发: 梨视频丢给思远了 微博关键词清洗代码
   解决方案待确认: 微博每日更新(不上平台) 微博博主回复(不上平台) 微博博主历史(上平台) 清洗解决与入库方案
   socket.io 添加心跳功能



detail与list对应关系

_bilibili bilibiliKeywordList bilibiliUserList
     \             |                 /
             bilibiliVideoDetail

_duowanPic === _duowanPicDetail

_haoqixin === _haoqixinDetail

toutiaoKeywordList === toutiaoKeywordDetail

toutiaoUserList === toutiaoUserDetail

wxPublicList wxXingBang
     \           /
     wxPublicDetail


爬虫名称对应
_bilibili                      bilibili_index_update
bilibiliKeywordList            duowanPic_index_update
bilibiliUserList               duowanPic_index_detail
bilibiliVideoDetail                 等等

_duowanPic
_duowanPicDetail

_haoqixin
_haoqixinDetail

toutiaoKeywordList
toutiaoKeywordDetail

toutiaoUserList
toutiaoUserDetail

wxPublicList
wxXingBang
wxPublicDetail


爬虫: 点赞 like


index_update
index_update 的触发
list页面 emit(listadd)(不需要) num_item_limit(不需要)
detail页面 emit个over(暂时不知道) 带上keyword/upname(不需要)
             s