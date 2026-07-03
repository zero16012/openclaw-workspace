# 关闭网易 GameViewer（暴露端口 22331, 56196）

Write-Host "正在关闭 GameViewer 服务和进程..." -ForegroundColor Yellow

# 停止服务
Stop-Service -Name GameViewerService -Force -ErrorAction SilentlyContinue
# 杀掉残留进程
Get-Process -Name "GameViewer*", "GameViewerServer*", "GameViewerHealthd*" -ErrorAction SilentlyContinue | Stop-Process -Force

# 禁用开机自启
Set-Service -Name GameViewerService -StartupType Manual

Write-Host ""
if ((Get-Process -Name "GameViewer*" -ErrorAction SilentlyContinue).Count -eq 0) {
    Write-Host "✅ GameViewer 已关闭，端口已释放" -ForegroundColor Green
    Write-Host "   下次开机不会自动启动" -ForegroundColor Green
} else {
    Write-Host "⚠️  部分进程未关闭，请确认以管理员身份运行" -ForegroundColor Yellow
}

pause
