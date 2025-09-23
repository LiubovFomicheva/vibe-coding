@echo off
echo Starting BuddyMatch Frontend...
cd /d "%~dp0"
cd BuddyMatch.Web
echo Current directory: %cd%
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Starting on HTTP port 3000...
npm start
pause