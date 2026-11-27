@echo off
chcp 65001 >nul
title BAZAAR Casual Wear VIP - Desktop Installer
color 0E
cls
echo ==============================================================================
echo               بازار كاجوال وير - BAZAAR Casual Wear VIP
echo             تثبيت تطبيق سطح المكتب المستقل (Windows Standalone App)
echo ==============================================================================
echo.
echo  جاري تجهيز الأيقونة عالية الدقة وتثبيت تطبيق بازار VIP على سطح المكتب...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-Bazaar.ps1"

echo.
echo ==============================================================================
echo        مبروك! تم تثبيت تطبيق بازار بنجاح على سطح المكتب وفتح المتجر.
echo ==============================================================================
echo.
timeout /t 3 >nul
exit /b 0
