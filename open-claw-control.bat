@echo off
chcp 65001 >nul
title OpenClaw Control

:: Check if gateway is running
echo [OpenClaw] Checking gateway status...

powershell -NoProfile -Command "try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 18789); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1

if %errorlevel% equ 0 (
    echo [OpenClaw] Gateway already running.
    goto open_browser
)

echo [OpenClaw] Gateway not running, starting...
start /min "" "C:\Program Files\nodejs\node.exe" "C:\Users\27091\AppData\Roaming\npm\node_modules\openclaw\dist\index.js" gateway --port 18789

:: Wait up to 15 seconds for gateway to be ready
echo [OpenClaw] Waiting for gateway...
set /a tries=0
:wait_loop
powershell -NoProfile -Command "try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 18789); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 goto gateway_ready
timeout /t 1 /nobreak >nul
set /a tries+=1
if %tries% lss 15 goto wait_loop
echo [OpenClaw] Gateway start timeout, opening anyway...
goto open_browser

:gateway_ready
echo [OpenClaw] Gateway ready.

:open_browser
echo [OpenClaw] Opening dashboard...
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge_proxy.exe" --profile-directory=Default --app-id=elaofidhnjoejcebffgfmpicgbdhdgcp --app-url=http://127.0.0.1:18789/ --app-launch-source=4
exit