@echo off
REM Double-click to run the Yeti Insurance site locally on Windows.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Install the LTS version from https://nodejs.org then run this again. & start https://nodejs.org/en/download & pause & exit /b 1)
node build.js || (pause & exit /b 1)
start "" http://localhost:8080
node serve.js --watch
