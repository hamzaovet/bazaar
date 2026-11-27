import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "bazaar-omega-one.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const cleanOrigin = `${proto}://${host}`.replace(/\/+$/, "");

  const psScript = `
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

# Find Chrome or Edge Browser
$browser = ''
$paths = @(
    "$env:ProgramFiles\\Google\\Chrome\\Application\\chrome.exe",
    "\${env:ProgramFiles(x86)}\\Google\\Chrome\\Application\\chrome.exe",
    "\${env:ProgramFiles(x86)}\\Microsoft\\Edge\\Application\\msedge.exe",
    "$env:ProgramFiles\\Microsoft\\Edge\\Application\\msedge.exe"
)
foreach ($pth in $paths) {
    if (Test-Path $pth) { $browser = $pth; break }
}

$dirApp = Join-Path $env:LOCALAPPDATA "BazaarCasualWearStandalone"
if (-not (Test-Path $dirApp)) { New-Item -ItemType Directory -Force -Path $dirApp | Out-Null }
$icoApp = Join-Path $dirApp "bazaar.ico"
try {
    Invoke-WebRequest -Uri "${cleanOrigin}/bazaar.ico" -OutFile $icoApp -UseBasicParsing -TimeoutSec 5
} catch {
    try { Invoke-WebRequest -Uri "${cleanOrigin}/favicon.ico" -OutFile $icoApp -UseBasicParsing -TimeoutSec 5 } catch {}
}

# The Main Application Shortcut opens the Landing Page!
$apps = @(
    @{ tempName = "Bazaar_VIP.lnk"; finalName = "بازار كاجوال وير VIP.lnk"; url = "${cleanOrigin}/"; desc = "BAZAAR Casual Wear VIP - المتجر والسيستم المتكامل" },
    @{ tempName = "Bazaar_POS.lnk"; finalName = "بازار - كاشير ونقطة البيع.lnk"; url = "${cleanOrigin}/pos"; desc = "BAZAAR POS Cashier" },
    @{ tempName = "Bazaar_Admin.lnk"; finalName = "بازار - لوحة الإدارة والمخزن.lnk"; url = "${cleanOrigin}/admin"; desc = "BAZAAR Admin & Inventory" }
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
        if (Test-Path $icoApp) { $sc.IconLocation = "$icoApp,0" }
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
    Start-Process $browser -ArgumentList ("--app=${cleanOrigin}/ --start-maximized")
}
`;

  const encoded = Buffer.from(psScript, "utf16le").toString("base64");

  const batContent = [
    "@echo off",
    "chcp 65001 >nul",
    "title BAZAAR Casual Wear - Desktop Installer",
    "color 0E",
    "cls",
    "echo ==============================================================================",
    "echo               بازار كاجوال وير - BAZAAR Casual Wear VIP",
    "echo             تثبيت تطبيق سطح المكتب المستقل (Windows Desktop App)",
    "echo ==============================================================================",
    "echo.",
    "echo  جاري تجهيز الأيقونة عالية الدقة وتثبيت تطبيق بازار VIP على سطح المكتب...",
    "echo.",
    `powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encoded}`,
    "echo.",
    "echo ==============================================================================",
    "echo        مبروك! تم تثبيت تطبيق بازار بنجاح على سطح المكتب وفتح المتجر.",
    "echo ==============================================================================",
    "echo.",
    "timeout /t 3 >nul",
    "exit /b 0",
  ].join("\r\n");

  return new NextResponse(batContent, {
    headers: {
      "Content-Type": "application/x-bat; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Install-Bazaar-VIP.bat"',
    },
  });
}
