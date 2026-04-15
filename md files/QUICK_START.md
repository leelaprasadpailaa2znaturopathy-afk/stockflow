# 🚀 StockFlow - Quick Start Guide

## How to Run the Project

### **Windows Users** (Easiest)

Double-click one of these files:

1. **`start.bat`** (Recommended - Windows Batch)
   - Automatically installs dependencies
   - Cleans up existing processes
   - Starts both frontend and backend
   - Shows URLs for quick access

2. **`start.ps1`** (PowerShell - Requires execution policy)
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\start.ps1
   ```

### **Mac / Linux Users**

Run this command in terminal:

```bash
chmod +x start.sh
./start.sh
```

Or double-click `start.sh` if your system allows executable shell scripts.

---

## 🌐 Access the Application

Once the server starts, you'll see:

```
Frontend: http://localhost:3000
Backend:  http://localhost:8080
Admin: admin@stockflow.com / kali
```

### **Public Access**
- **Inventory Dashboard**: Open `http://localhost:3000` in your browser
- Anyone can view products without login

### **Admin Access**
- Click **"Admin Login"** button
- Email: `admin@stockflow.com`
- Password: `kali`
- Access to Manage and Logs tabs

---

## 📋 What Happens When You Run

1. **Dependency Check**: Installs `npm` packages if needed
2. **Process Cleanup**: Kills any existing Node processes
3. **Server Start**: Launches both:
   - Frontend (Vite) on port 3000
   - Backend (Express) on port 8080
4. **Database**: Automatically connects to MongoDB Atlas

---

## 🛑 Stopping the Project

Press `Ctrl + C` in the terminal to stop both frontend and backend.

---

## 🔧 Troubleshooting

### Port Already in Use?
- The startup script automatically kills existing Node processes
- If you still get "port in use" error, manually kill Node:
  ```
  Windows: taskkill /F /IM node.exe
  Mac/Linux: pkill node
  ```

### MongoDB Connection Failed?
- Ensure you have internet (MongoDB Atlas needs connection)
- Or set up local MongoDB on `mongodb://localhost:27017`

### Dependencies Not Installing?
- Delete `node_modules` folder
- Run the startup script again
- Or manually run: `npm install`

---

## 📚 File Structure

```
stockflow/
├── start.bat          ⭐ Windows (Easy - Just double-click!)
├── start.ps1          🔵 PowerShell (Windows alternative)
├── start.sh           🍎 Mac/Linux
├── src/               💻 Frontend React code
├── server.ts          🖥️ Backend Express server
├── package.json       📦 Dependencies
└── ...
```

---

## ✨ Features

✅ Public inventory dashboard (no login required)
✅ Admin product management (login required)
✅ MongoDB database for product storage
✅ JWT authentication for admins
✅ Product filtering, search, pagination
✅ JSON & CSV export functionality
✅ Activity logging
✅ Responsive design

---

Enjoy using StockFlow! 🎉
