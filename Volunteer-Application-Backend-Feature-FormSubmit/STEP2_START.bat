@echo off
echo ================================================
echo  KeelWorks Backend - Starting Server
echo ================================================
echo.
cd /d "%~dp0src"
call npm start
pause
