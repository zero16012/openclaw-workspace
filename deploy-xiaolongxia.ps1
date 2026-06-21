<#
╔══════════════════════════════════════════════════╗
║   🦞 小龙虾 (OpenClaw) Windows 一键部署脚本      ║
║   PowerShell 版 | BOOS 专用 🚀                   ║
╚══════════════════════════════════════════════════╝
用法：
  1. 以管理员身份运行 PowerShell
  2. 执行: .\deploy-xiaolongxia.ps1
  3. 坐着等
#>

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "🦞 小龙虾 OpenClaw 一键部署中..."

Write-Host ""
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🦞 小龙虾 (OpenClaw) 一键部署       ║" -ForegroundColor Cyan
Write-Host "║     让 AI 自己给自己装好              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: 管理员检查 ───
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ 请以管理员身份运行此脚本！右键 -> 以管理员身份运行" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ 管理员权限 OK" -ForegroundColor Green

# ─── Step 2: 检查 Node.js ───
$nodeVersion = $null
try {
    $nodeVersion = node --version 2>$null
} catch {}
if ($nodeVersion) {
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "📥 正在安装 Node.js LTS ..." -ForegroundColor Yellow
    # 下载 Node.js LTS MSI
    $nodeUrl = "https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
    } catch {
        Write-Host "⚠️ 官方源下载失败，尝试国内镜像..." -ForegroundColor Yellow
        $nodeUrl = "https://npmmirror.com/mirrors/node/v22.14.0/node-v22.14.0-x64.msi"
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
    }
    
    Write-Host "⏳ 正在安装 Node.js（静默安装）..." -ForegroundColor Yellow
    Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait
    
    # 刷新 PATH
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    
    $nodeVersion = node --version
    Write-Host "✅ Node.js 安装完成: $nodeVersion" -ForegroundColor Green
}

# ─── Step 3: 检查 npm ───
$npmVersion = npm --version
Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green

# ─── Step 4: 设置 npm 镜像（国内加速） ───
Write-Host "🌐 配置 npm 国内镜像源（加速下载）..." -ForegroundColor Yellow
npm config set registry https://registry.npmmirror.com 2>$null
Write-Host "✅ npm 镜像源已设为 npmmirror.com" -ForegroundColor Green

# ─── Step 5: 全局安装 OpenClaw ───
Write-Host ""
Write-Host "📦 全局安装 OpenClaw（小龙虾）..." -ForegroundColor Yellow
Write-Host "   这步可能需要几分钟，喝口水 🚀" -ForegroundColor Cyan
Write-Host ""

npm install -g openclaw 2>&1 | ForEach-Object {
    if ($_ -match "error|ERR|fail") {
        Write-Host "   ❌ $_" -ForegroundColor Red
    } elseif ($_ -match "added|changed|removed") {
        Write-Host "   ✅ $_" -ForegroundColor Green
    } else {
        Write-Host "   $_"
    }
}

# 验证安装
$ocVersion = openclaw --version 2>$null
if (-not $ocVersion) {
    Write-Host "❌ OpenClaw 安装失败，请检查网络后重试" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ OpenClaw 安装成功: $ocVersion" -ForegroundColor Green

# ─── Step 6: 初始化配置（onboard） ───
Write-Host ""
Write-Host "⚙️  初始化 OpenClaw 配置..." -ForegroundColor Yellow
Write-Host "   注意：这会进入交互式设置，请按提示操作" -ForegroundColor Cyan
Write-Host "   如果不想交互，可以之后手动运行: openclaw onboard" -ForegroundColor Cyan
Write-Host ""

openclaw onboard --install-daemon 2>&1

# ─── Step 7: 检查服务状态 ───
Write-Host ""
Write-Host "🔍 检查 Gateway 服务状态..." -ForegroundColor Yellow
$service = Get-Service openclaw-gateway -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "✅ OpenClaw Gateway 服务已安装" -ForegroundColor Green
    Write-Host "   Status: $($service.Status)" -ForegroundColor Green
    
    if ($service.Status -ne 'Running') {
        Write-Host "🔄 启动服务..." -ForegroundColor Yellow
        Start-Service openclaw-gateway
        Write-Host "✅ 服务已启动" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  未检测到服务，可能需要手动启动 Gateway" -ForegroundColor Yellow
    Write-Host "   试试: openclaw gateway start" -ForegroundColor Yellow
}

# ─── 完成 ───
Write-Host ""
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🎉 小龙虾部署完成！                  ║" -ForegroundColor Green
Write-Host "║                                      ║" -ForegroundColor Green
Write-Host "║   打开浏览器访问:                     ║" -ForegroundColor Green
Write-Host "║   http://localhost:7171              ║" -ForegroundColor Green
Write-Host "║                                      ║" -ForegroundColor Green
Write-Host "║   常用命令:                          ║" -ForegroundColor Green
Write-Host "║   openclaw status  → 查看状态        ║" -ForegroundColor Green
Write-Host "║   openclaw gateway start → 启动      ║" -ForegroundColor Green
Write-Host "║   openclaw onboard    → 重新配置     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

pause
