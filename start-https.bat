@echo off
title Hausarztpraxis Airoud - HTTPS Server
echo.
echo 🔒 Hausarztpraxis Airoud Website (HTTPS)
echo ========================================
echo.
echo Starting HTTPS Development Server...
echo Access: https://localhost:443
echo Admin:  https://localhost:443/admin
echo.
echo Login: admin / Praxis2025AiroudSecure
echo.
echo ⚠️  Browser will show security warning for dev certificate
echo    Click "Advanced" → "Proceed to localhost"
echo.
echo Press Ctrl+C to stop the server
echo.

node scripts/start-server.js https

pause
