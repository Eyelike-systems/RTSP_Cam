@echo off
setlocal

:: CONFIGURATION
set "PORT=3010"
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "DASHBOARD=https://app.eyelikesystems.com/dashboard/"
set "MAX_RETRIES=30"
set "RETRY_DELAY=2"

echo Waiting for Node.js server to start on port %PORT%...

set /a count=0
:waitloop
netstat -ano | findstr /R ":%PORT%.*LISTENING" > nul
if %errorlevel% neq 0 (
    set /a count+=1
    if %count% geq %MAX_RETRIES% (
        echo Server did not start in time. Exiting.
        exit /B 1
    )
    timeout /t %RETRY_DELAY% > nul
    goto waitloop
)

echo Server is up! Opening Chrome in fullscreen...

:: Open Chrome in kiosk mode (or use --start-fullscreen for full screen with controls)
start "" "%CHROME_PATH%" --kiosk "%DASHBOARD%"
