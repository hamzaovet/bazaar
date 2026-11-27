param(
    [string]$BaseUrl = "https://bazaar-omega-one.vercel.app"
)
$BaseUrl = $BaseUrl.TrimEnd('/')

$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'

$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$programs = [Environment]::GetFolderPath('Programs')

# Clean up any old duplicate or mistyped shortcuts
foreach ($folder in @($desktop, $programs)) {
    if (Test-Path $folder) {
        Get-ChildItem $folder -Filter "*بزار*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem $folder -Filter "*BAZAAR Casual Wear*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

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
$localIco = Join-Path $scriptDir 'bazaar.ico'
if (-not (Test-Path $localIco)) {
    $localIco = Join-Path $scriptDir 'public\bazaar.ico'
}

if (Test-Path $localIco) {
    Copy-Item -Force $localIco $icoDest
} else {
    try {
        Invoke-WebRequest -Uri "$BaseUrl/bazaar.ico" -OutFile $icoDest -UseBasicParsing -TimeoutSec 5
    } catch {
        try { Invoke-WebRequest -Uri "$BaseUrl/favicon.ico" -OutFile $icoDest -UseBasicParsing -TimeoutSec 5 } catch {}
    }
}

# The main application shortcut opens the Landing Page!
$apps = @(
    @{ tempName = "Bazaar_VIP.lnk"; finalName = "بازار كاجوال وير VIP.lnk"; url = "$BaseUrl/"; desc = "BAZAAR Casual Wear VIP - المتجر والسيستم المتكامل" },
    @{ tempName = "Bazaar_POS.lnk"; finalName = "بازار - كاشير ونقطة البيع.lnk"; url = "$BaseUrl/pos"; desc = "BAZAAR POS Cashier" },
    @{ tempName = "Bazaar_Admin.lnk"; finalName = "بازار - لوحة الإدارة والمخزن.lnk"; url = "$BaseUrl/admin"; desc = "BAZAAR Admin & Inventory" }
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
Write-Host "  [OK] تم بنجاح تثبيت تطبيق بازار كاجوال وير VIP على سطح المكتب!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

# Automatically launch the Landing Page!
if ($browser) {
    Start-Process $browser -ArgumentList ("--app=$BaseUrl/ --start-maximized")
}
