# 🛡️ 关闭所有不安全的开机自启项
# 包含：Radmin VPN / GameViewer / Flash 服务
# 必须以管理员身份运行！

Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🛡️  关闭不安全开机自启            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$items = @(
    @{Name="Radmin VPN"; Service="RvControlSvc"},
    @{Name="GameViewer"; Service="GameViewerService"},
    @{Name="Flash Helper"; Service="Flash Helper Service"},
    @{Name="Flash Center"; Service="FlashCenterSvc"}
)

foreach ($item in $items) {
    Write-Host "  [处理] $($item.Name)..." -NoNewline
    try {
        # 停止服务
        Stop-Service -Name $item.Service -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 200
        # 改成手动启动
        Set-Service -Name $item.Service -StartupType Manual
        Write-Host " ✅ 已禁用自启" -ForegroundColor Green
    } catch {
        Write-Host " ❌ 失败" -ForegroundColor Red
    }
}

# 杀掉剩下的 GameViewer 进程
Get-Process -Name "GameViewer*", "GameViewerServer*", "GameViewerHealthd*" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "  🎯 已处理完毕！重启后这些服务都不会再自启了。" -ForegroundColor Green
Write-Host "  要点一次重启吗？如果不用，下次关机重启就生效。" -ForegroundColor Yellow
pause
