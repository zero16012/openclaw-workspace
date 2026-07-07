Write-Host "=== 卸载 Voicemeeter 系列 + VB-CABLE ==="

# 1. 卸载 Voicemeeter (主程序)
$vmSetup = "C:\Program Files (x86)\VB\Voicemeeter\voicemeeterprosetup.exe"
if (Test-Path $vmSetup) {
    Write-Host "卸载 Voicemeeter..."
    Start-Process -FilePath $vmSetup -ArgumentList "/uninstall" -Wait -NoNewWindow
    Start-Process -FilePath $vmSetup -ArgumentList "/u" -Wait -NoNewWindow
    Write-Host "  Voicemeeter 卸载完成"
} else {
    Write-Host "  未找到 Voicemeeter 安装程序"
}

# 2. 卸载 VB-CABLE
$cableSetup = "C:\Program Files\VB\CABLE\VBCABLE_Setup_x64.exe"
if (Test-Path $cableSetup) {
    Write-Host "卸载 VB-CABLE..."
    Start-Process -FilePath $cableSetup -ArgumentList "/uninstall" -Wait -NoNewWindow
    Start-Process -FilePath $cableSetup -ArgumentList "/u" -Wait -NoNewWindow
    Write-Host "  VB-CABLE 卸载完成"
} else {
    Write-Host "  未找到 VB-CABLE 安装程序"
}

# 3. 卸载 VBVoicemeeterVAIO
$vaioSetup = "C:\Program Files\VB\VBVoicemeeterVAIOs\VBVoicemeeterVAIO_Setup_x64.exe"
if (Test-Path $vaioSetup) {
    Write-Host "卸载 VBVoicemeeterVAIO..."
    Start-Process -FilePath $vaioSetup -ArgumentList "/uninstall" -Wait -NoNewWindow
    Start-Process -FilePath $vaioSetup -ArgumentList "/u" -Wait -NoNewWindow
    Write-Host "  VBVoicemeeterVAIO 卸载完成"
} else {
    Write-Host "  未找到 VBVoicemeeterVAIO 安装程序"
}

# 4. 卸载 VBVMAUX
$auxSetup = "C:\Program Files (x86)\VB\Voicemeeter\VBVMAUX_Setup_x64.exe"
if (Test-Path $auxSetup) {
    Write-Host "卸载 VBVMAUX..."
    Start-Process -FilePath $auxSetup -ArgumentList "/uninstall" -Wait -NoNewWindow
    Start-Process -FilePath $auxSetup -ArgumentList "/u" -Wait -NoNewWindow
    Write-Host "  VBVMAUX 卸载完成"
} else {
    Write-Host "  未找到 VBVMAUX 安装程序"
}

# 5. 删除残留文件
Write-Host "清理残留文件..."
$dirs = @(
    "C:\Program Files (x86)\VB",
    "C:\Program Files\VB\CABLE",
    "C:\Program Files\VB\VBVoicemeeterVAIOs"
)
foreach ($d in $dirs) {
    if (Test-Path $d) {
        Remove-Item -Path $d -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  已删除: $d"
    }
}
# 如果 VB 目录空了也删掉
if (Test-Path "C:\Program Files\VB") {
    $items = Get-ChildItem "C:\Program Files\VB"
    if ($items.Count -eq 0) {
        Remove-Item "C:\Program Files\VB" -Force -ErrorAction SilentlyContinue
        Write-Host "  已删除: C:\Program Files\VB"
    }
}

Write-Host "`n=== 清理完成 ==="
Write-Host "建议重启电脑使驱动彻底移除"
