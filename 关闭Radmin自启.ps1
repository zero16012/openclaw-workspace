# 关闭 Radmin VPN 开机自启
Write-Host "正在关闭 Radmin VPN 开机自启..." -ForegroundColor Yellow
Set-Service -Name RvControlSvc -StartupType Manual
if ($?) {
    Write-Host "✅ 已关闭！下次开机不会再自动启动了" -ForegroundColor Green
} else {
    Write-Host "❌ 失败，请右键选择「以 PowerShell 管理员身份运行」" -ForegroundColor Red
}
pause
