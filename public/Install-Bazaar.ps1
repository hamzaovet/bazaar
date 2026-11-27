$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'

$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$programs = [Environment]::GetFolderPath('Programs')

# Find Browser
$browser = ''
$paths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
foreach ($pth in $paths) {
    if (Test-Path $pth) { $browser = $pth; break }
}

$dirApp = Join-Path $env:LOCALAPPDATA 'BazaarCasualWearStandalone'
if (-not (Test-Path $dirApp)) { New-Item -ItemType Directory -Force -Path $dirApp | Out-Null }
$icoDest = Join-Path $dirApp 'bazaar.ico'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$localIco = Join-Path $scriptDir 'public\bazaar.ico'
if (-not (Test-Path $localIco)) {
    $localIco = Join-Path $scriptDir 'bazaar.ico'
}

if (Test-Path $localIco) {
    Copy-Item -Force $localIco $icoDest
} else {
    try {
        Invoke-WebRequest -Uri 'http://localhost:3099/bazaar.ico' -OutFile $icoDest -UseBasicParsing -TimeoutSec 3
    } catch {}
}

# The main application shortcut opens the Landing Page!
$apps = @(
    @{ tempName = "Bazaar_VIP.lnk"; finalName = "بزار كاجوال وير VIP.lnk"; url = "http://localhost:3099/"; desc = "BAZAAR Casual Wear VIP - المتجر والسيستم المتكامل" },
    @{ tempName = "Bazaar_POS.lnk"; finalName = "بزار - كاشير ونقطة البيع.lnk"; url = "http://localhost:3099/pos"; desc = "BAZAAR POS Cashier" },
    @{ tempName = "Bazaar_Admin.lnk"; finalName = "بزار - لوحة الإدارة والمخزن.lnk"; url = "http://localhost:3099/admin"; desc = "BAZAAR Admin & Inventory" }
)

foreach ($app in $apps) {
    foreach ($folder in @($desktop, $programs)) {
        if (-not (Test-Path $folder)) { continue }
        $tempPath = Join-Path $folder $app.tempName
        $finalPath = Join-Path $folder $app.finalName
        
        $sc = $ws.CreateShortcut($tempPath)
        if ($browser) {
            $sc.TargetPath = $browser
            $sc.Arguments = "--app=" + $app.url + " --start-maximized"
        } else {
            $sc.TargetPath = $app.url
        }
        if (Test-Path $icoDest) {
            $sc.IconLocation = "$icoDest,0"
        }
        $sc.Description = $app.desc
        $sc.Save()

        if (Test-Path $tempPath) {
            Move-Item -Force -Path $tempPath -Destination $finalPath
        }
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  [OK] تم بنجاح تثبيت تطبيق بزار كاجوال وير VIP على سطح المكتب!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

# Automatically launch the Landing Page!
if ($browser) {
    Start-Process $browser -ArgumentList ("--app=http://localhost:3099/ --start-maximized")
}
