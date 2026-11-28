@echo off
chcp 65001 > nul
echo ===================================================
echo   BAZAAR VIP - AUTOMATED BRAND WATERMARKING
echo   توقيع بازار كاجوال وير الملكي على الصور
echo ===================================================
echo.
echo جاري معالجة ودمج الختم الذهبي على جميع صور flow_outputs...
echo.

python "D:\Work\bazaar\scripts\brand_images.py"

echo.
echo ===================================================
echo   تم ختم جميع الصور بنجاح ونقلها إلى:
echo   D:\Work\bazaar\LP\branded
echo ===================================================
pause
