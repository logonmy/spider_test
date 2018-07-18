@echo off& echo wscript.sleep wscript.arguments(0)*1000>sleep.vbs

:START

taskkill /f /im "chrome.exe"

echo %DATE%
echo %TIME%

start "" "C:/User/Administrator/AppData/Local/Google/Chrome/Application/chrome.exe"
start node "D:/spider4.0/nodePart/phoneCheck/check.js"
start node "D:/spider5.0/HiveSpider/weibo/fixUser.js"

echo "运行完成"

sleep.vbs 3000

goto START