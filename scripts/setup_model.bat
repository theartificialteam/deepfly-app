@echo off
echo ========================================
echo DeepFly Model Setup Script
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Python found!
echo.

:: Navigate to script directory
cd /d "%~dp0"

:: Run the Python script
echo Running model download and conversion...
echo.
python download_and_convert_model.py

if errorlevel 1 (
    echo.
    echo ERROR: Model setup failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Model setup complete!
echo ========================================
echo.
echo You can now run the app with: npx expo start
echo.
pause




