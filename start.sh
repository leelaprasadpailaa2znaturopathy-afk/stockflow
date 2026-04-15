#!/bin/bash

# ========================================
# StockFlow - Start Development Server
# ========================================

echo ""
echo "========================================"
echo "  StockFlow Project Startup"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[1/3] Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        read -p "Press Enter to exit"
        exit 1
    fi
    echo "[1/3] Dependencies installed successfully"
    echo ""
else
    echo "[1/3] Dependencies already installed"
    echo ""
fi

# Kill any existing Node processes
echo "[2/3] Cleaning up existing processes..."
pkill -f "node" 2>/dev/null || true
sleep 1
echo "[2/3] Processes cleaned up"
echo ""

# Start the development server
echo "[3/3] Starting development server..."
echo ""
echo "========================================"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo "  Admin: admin@stockflow.com / kali"
echo "========================================"
echo ""

npm run dev
