# StockFlow - Setup Verification Guide ✅

## Health Check Dashboard

Your app now includes a **System Health Check** that displays on every page. It shows:

### ✅ What Gets Checked

| Component | What It Checks | How to Fix |
|-----------|---------------|-----------|
| **Frontend** | React app is running | Should always be ✅ if you see this page |
| **Backend API** | Express server on port 5000 | Run: `npm run dev` |
| **MongoDB** | Database connection | Start: `mongod` in new terminal |
| **Authentication** | Admin login status | Click "Admin Login" to authenticate |

---

## Step-by-Step Verification

### 1. **Check Frontend** ✅
- If you're reading this = Frontend is working ✅

### 2. **Check Backend** 🔧
**Status: Connected**
- Backend running on `http://localhost:5000`
- If failing: Run `npm run dev` in terminal

**To verify manually:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","message":"Stockflow API running"}
```

### 3. **Check MongoDB** 🗄️
**Status: Connected**
- Database running on `localhost:27017`
- If failing: Run `mongod` in separate terminal

**To verify manually:**
```bash
# Windows Command Prompt:
mongod
# Should show: "Waiting for connections on port 27017"
```

### 4. **Check Authentication** 🔐
**Status: Not Logged In (until you login)**
- Click "Admin Login" button
- Enter credentials:
  - Email: `admin@stockflow.com`
  - Password: `Tgh@2025` (from .env)
- After login: Authentication will show ✅

---

## Troubleshooting by Status

### ❌ Frontend: Error
- This shouldn't happen if you're seeing this page
- Run: `npm run dev`
- Check: Browser console (F12)

### ❌ Backend: Error
**Symptoms:**
- Cannot add/edit products
- Login fails
- API not responding

**Fix:**
```bash
# Terminal 2 - Start backend
cd c:\Users\USER\Downloads\stockflow
npm run dev
```

**Check logs for:**
```
🚀 Stockflow API running on http://localhost:5000
✅ MongoDB connected
```

### ❌ MongoDB: Error
**Symptoms:**
- Backend crashes with "connection refused"
- Products won't load
- Admin Dashboard shows "Failed to fetch"

**Fix:**
```bash
# Terminal 3 - Start MongoDB
mongod
# Wait for: "Waiting for connections on port 27017"
```

**Or use Docker:**
```bash
docker run -d -p 27017:27017 --name stockflow-mongo mongo:latest
```

### ❌ Authentication: Error
**Symptoms:**
- Cannot access "Manage" or "Logs" tabs
- Operations fail with "401 Unauthorized"

**Fix:**
1. Click "Admin Login" button
2. Enter: `admin@stockflow.com`
3. Enter: `Tgh@2025`
4. Click "Login"

**Still failing?**
- Check .env has correct credentials
- Restart backend: `npm run dev`
- Clear browser cache: Ctrl+Shift+Del

---

## Complete Startup Sequence

```
Terminal 1: MongoDB
─────────────────────
$ mongod
✅ Waiting for connections on port 27017

Terminal 2: StockFlow App
─────────────────────
$ npm run dev

🚀 Backend:  http://localhost:5000
✅ Frontend: http://localhost:3001

Terminal 3: Browser
─────────────────────
Open: http://localhost:3001
See Health Check ✅
Login with admin@stockflow.com / Tgh@2025
```

---

## Quick Test After Setup

### 1. **Check All Systems Green ✅**
- Reload page (F5)
- Verify all 4 health checks show: "Connected"

### 2. **Test Login**
- Click "Admin Login"
- Enter: `admin@stockflow.com` / `Tgh@2025`
- Should redirect to "Manage" tab

### 3. **Test Add Product**
- Click "Manage" tab
- Click "Add Product"
- Enter: Name="Test Product", Category="Electronics"
- Click "Add"
- Should see success message ✅

### 4. **Test View Product**
- Click "Inventory" tab
- Should see your test product in the list

### 5. **Test Edit Product**
- Click "Manage" tab
- Click edit icon on product
- Change quantity
- Click "Save"
- Should show success ✅

### 6. **Test Logs**
- Click "Logs" tab
- Should see activity log with your changes

---

## Environment Variables Check

Your `.env` file should have:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stockflow

# Security
JWT_SECRET=stockflow-dev-secret-key-change-production

# Admin Login
ADMIN_EMAIL=admin@stockflow.com
ADMIN_PASSWORD=Tgh@2025

# Server
PORT=5000
VITE_API_URL=http://localhost:5000
```

**To verify:**
```bash
cat .env  # Windows PowerShell
```

---

## Health Check API Endpoint

You can check backend health directly:

```bash
# Linux/Mac
curl http://localhost:5000/api/health

# Windows PowerShell
Invoke-WebRequest http://localhost:5000/api/health

# Response should be:
# {"status":"ok","message":"Stockflow API running"}
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| All systems show ❌ | Multiple services not running | Start all 3 terminals: mongod, npm run dev |
| Backend shows ❌ only | Express server crashed | Check terminal for errors, restart: `npm run dev` |
| MongoDB shows ❌ only | MongoDB not running | Start: `mongod` in new terminal |
| Login fails 401 | Wrong credentials or JWT expired | Check .env, restart backend |
| Products won't load | No MongoDB connection | Start: `mongod` |
| Can't add products | Not authenticated or backend error | Login first, check backend logs |
| Port 3000/5000 in use | Another app using port | Change PORT in .env or kill process |

---

## Verify Everything Works (5-minute checklist)

- [ ] Health Check shows all 4 systems connected ✅
- [ ] Can login with admin@stockflow.com / Tgh@2025
- [ ] Can see "Manage" and "Logs" tabs after login
- [ ] Can add product in "Manage" tab
- [ ] Product appears in "Inventory" tab
- [ ] Can edit product in "Manage" tab
- [ ] Can see activity log in "Logs" tab
- [ ] MongoDB logs show operations
- [ ] Backend terminal shows no errors

**If all checked:** 🎉 **Setup Complete!**

---

## Advanced: Manual Database Check

```bash
# Open MongoDB shell
mongosh

# In MongoDB shell:
use stockflow
db.products.find()      # View all products
db.logs.find()          # View all activity logs
db.products.count()     # Count products
exit
```

---

## Next: Deployment

See `SETUP_COMPLETE.md` for deployment options when ready!

---

**Need help?** Check the Health Check dashboard - it tells you exactly what's not working! 🚀
