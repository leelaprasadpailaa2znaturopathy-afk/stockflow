# MongoDB Installation & Startup Guide

## Windows Users - Recommended: MongoDB Community Edition

### Step 1: Download MongoDB
Visit: https://www.mongodb.com/try/download/community

**Select:**
- Windows 64-bit
- MSI installer
- Click "Download"

### Step 2: Run Installer
1. Double-click `mongodb-*-windows-x86_64-*.msi`
2. Click through installation (keep defaults)
3. When asked "Install MongoDB as a Service" → **YES** (easier)
4. Click "Install"

### Step 3: Verify Installation
Open Command Prompt and run:
```bash
mongod --version
```

You should see:
```
db version v7.0.0
Build Info: ...
```

---

## Option B: Using Docker (Alternative)

If you have Docker Desktop installed:

```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name stockflow-mongo mongo:latest

# Verify it's running
docker ps | find "stockflow-mongo"
```

---

## Option C: MongoDB Atlas (Cloud - No Installation)

**Easiest for production!**

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/stockflow
   ```

---

## Starting StockFlow

### Terminal 1: Start MongoDB
```bash
mongod
```

Wait for:
```
Waiting for connections on port 27017
```

**Keep this terminal open!**

---

### Terminal 2: Start StockFlow App

```bash
cd c:\Users\USER\Downloads\stockflow
npm install    # First time only
npm run dev
```

Wait for:
```
🚀 Stockflow API running on http://localhost:5000
✨ Vite server running...
```

---

## Terminal 3: Open Browser

Go to: **http://localhost:3000**

---

## Login

**Email:** admin@stockflow.com
**Password:** admin123

---

## Test It

1. Click "Admin Login" tab
2. Enter credentials
3. Click "Manage" tab
4. Add a product
5. See it instantly in "Inventory" tab

---

## Success! ✅

If you see products and can add/edit them = **Everything is working!**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Can't connect to MongoDB" | Make sure `mongod` is running in Terminal 1 |
| "Port 27017 in use" | MongoDB already running or change port in .env |
| "npm: command not found" | Install Node.js from nodejs.org |
| "Cannot find module" | Run `npm install` again |
| "Login fails with 401" | Check `.env` has correct email/password |
| "API not responding" | Restart with `npm run dev` |

---

## Next: Deploy to Production

See [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for deployment options.

Happy developing! 🚀
