@echo off
chcp 65001 >nul
title 🚀 OpenClaw Control

:: 检测网关是否运行
curl -s -o nul http://127.0.0.1:18789/ --connect-timeout 2 >nul 2>&1
if %errorlevel% neq 0 (
    echo 🚀 正在启动网关...
    start /min "openclaw" openclaw gateway restart
    timeout /t 5 /nobreak >nul
)

:: 打开 PWA 面板
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge_proxy.exe" --profile-directory=Default --app-id=elaofidhnjoejcebffgfmpicgbdhdgcp --app-url=http://127.0.0.1:18789/ --app-launch-source=4
exit
