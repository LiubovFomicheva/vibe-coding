@echo off
echo Starting BuddyMatch Backend API...
cd /d "%~dp0"
cd BuddyMatch.Api
echo Current directory: %cd%
echo Starting on HTTP port 5104...
dotnet run --launch-profile http
pause
