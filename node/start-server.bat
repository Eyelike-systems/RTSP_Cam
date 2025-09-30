@echo off
setlocal

:: Config
set "APP_NAME=start.js"
set "APP_DIR=%~dp0"
set "NODE_PATH=C:\Program Files\nodejs\node.exe"
set "PORT=3010"

:: Check if port 3010 is already in use (server running)
for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R ":%PORT%.*LISTENING"') do (
    exit /B
)

:: Change to project directory
cd /d "%APP_DIR%"

:: Start the Node.js server
"%NODE_PATH%" "%APP_NAME%"
