@echo off& echo wscript.sleep wscript.arguments(0)*1000>sleep.vbs

:START

taskkill /f /im "chrome.exe"

echo %DATE%
echo %TIME%

start "" "chrome路径"

echo "运行完成"

sleep.vbs 300

goto START