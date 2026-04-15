#!/usr/bin/env pwsh

Write-Host ""
Write-Host "========================================"
Write-Host "  StockFlow Project Startup"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/3] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[1/3] Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[1/3] Dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

# Kill any existing Node processes
Write-Host "[2/3] Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 1000
Write-Host "[2/3] Processes cleaned up" -ForegroundColor Green
Write-Host ""

# Start the development server
Write-Host "[3/3] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================"
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Admin: admin@stockflow.com / kali" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
