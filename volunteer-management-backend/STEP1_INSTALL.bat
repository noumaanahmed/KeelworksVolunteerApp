@echo off
echo ================================================
echo  KeelWorks Backend - Install Dependencies
echo ================================================
echo.
echo Installing inside src folder...
cd /d "%~dp0src"
call npm install
echo.
echo ================================================
echo  Install complete! Now run STEP2_START.bat
echo ================================================
pause
