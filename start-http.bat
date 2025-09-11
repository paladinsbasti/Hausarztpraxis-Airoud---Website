@echo off
title Hausarztpraxis Airoud - HTTP Server
echo.
echo 🚀 Hausarztpraxis Airoud Website
echo ================================
echo.
echo Starting HTTP Development Server...
echo Access: http://localhost:3000
echo Admin:  http://localhost:3000/admin
echo.
echo Login: admin / Praxis2025AiroudSecure
echo.
echo Press Ctrl+C to stop the server
echo.

node scripts/start-server.js http

pause
