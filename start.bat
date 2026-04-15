@echo off
REM ========================================
REM StockFlow - Start Development Server
REM ========================================

echo.
echo ========================================
echo   StockFlow Project Startup
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [1/3] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo [1/3] Dependencies installed successfully
    echo.
) else (
    echo [1/3] Dependencies already installed
    echo.
)

REM Kill any existing Node processes
echo [2/3] Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo [2/3] Processes cleaned up
echo.

REM Start the development server
echo [3/3] Starting development server...
echo.
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8080
echo   Admin: admin@stockflow.com
echo ========================================
echo.

call npm run dev

pause
