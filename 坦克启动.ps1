# 🚀 坦克启动 - 一键召唤你的 AI 助手
$host.UI.RawUI.WindowTitle = "🚀 坦克启动"
$host.UI.RawUI.BackgroundColor = "Black"
$host.UI.RawUI.ForegroundColor = "Cyan"
Clear-Host

$gatewayUrl = "http://127.0.0.1:18789/"

function Test-Gateway {
    try {
        $req = [System.Net.WebRequest]::Create($gatewayUrl)
        $req.Timeout = 2000
        $resp = $req.GetResponse()
        $resp.Close()
        return $true
    } catch { return $false }
}

function Show-Header {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║" -ForegroundColor Cyan -NoNewline
    Write-Host "         🚀  坦 克 启 动                 " -NoNewline
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║" -ForegroundColor Cyan -NoNewline
    Write-Host "      AI 助手 · 随叫随到 · 直接开干        " -NoNewline
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# === 主流程 ===
Show-Header

# 检测网关
if (Test-Gateway) {
    Write-Host "  ✅ 网关运行中" -ForegroundColor Green
} else {
    Write-Host "  🚀 正在启动网关..." -ForegroundColor Yellow
    $p = Start-Process -FilePath "openclaw" -ArgumentList "gateway","restart" -NoNewWindow -Wait -PassThru
    Start-Sleep -Seconds 4
    if (Test-Gateway) {
        Write-Host "  ✅ 网关已启动" -ForegroundColor Green
    } else {
        Write-Host "  ❌ 网关启动失败，试试手动运行: openclaw gateway restart" -ForegroundColor Red
        pause
        exit
    }
}

Write-Host ""
Write-Host "  正在打开坦克·WebChat ..." -ForegroundColor Yellow
Start-Sleep -Milliseconds 500
Start-Process $gatewayUrl
Write-Host ""
Write-Host "  ✅ 浏览器已打开，开始吧 👋" -ForegroundColor Green
Write-Host ""
pause
