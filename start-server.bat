@echo off
cd /d "%~dp0"
title Lions Club of Byculla - Local Server

echo ================================================
echo    Lions Club of Byculla - local preview
echo ================================================
echo.

where node >nul 2>nul
if %errorlevel%==0 (
  set "NODE=node"
) else (
  set "NODE=C:\Program Files (x86)\Brackets\node.exe"
)

echo Opening the site in your browser...
start "" "http://localhost:5501/news.html#bulletin"

echo.
"%NODE%" "%~dp0server.js"

echo.
echo Server stopped. Press any key to close.
pause >nul
