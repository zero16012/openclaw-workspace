# 🚀 OpenClaw Control - 自动启动网关 + 打开面板
$gatewayUrl = "http://127.0.0.1:18789/"

# 检测网关是否在运行
$running = $false
try {
    $resp = [System.Net.WebRequest]::Create($gatewayUrl)
    $resp.Timeout = 2000
    $resp.GetResponse().Close()
    $running = $true
} catch {}

# 没运行就启动
if (-not $running) {
    Start-Process -FilePath "openclaw" -ArgumentList "gateway", "restart" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

# 打开 Edge PWA
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge_proxy.exe"
$args = "--profile-directory=Default", "--app-id=elaofidhnjoejcebffgfmpicgbdhdgcp", "--app-url=$gatewayUrl", "--app-launch-source=4"
Start-Process -FilePath $edge -ArgumentList $args
