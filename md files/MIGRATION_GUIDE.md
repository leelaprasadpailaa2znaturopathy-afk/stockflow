# StockFlow - MongoDB Migration Complete ✅

## Quick Start Guide

### 1. **Install MongoDB Locally** (Windows)

#### Option A: MongoDB Community Edition (Recommended)
```bash
# Download installer from: https://www.mongodb.com/try/download/community
# Run installer
# Keep default settings (Local Server on port 27017)
# Verify installation by running in new terminal:
mongod --version
```

#### Option B: Using Chocolatey (if installed)
```bash
choco install mongodb-community
```

#### Option C: Using Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

### 2. **Start MongoDB Server**

**Windows Command Prompt:**
```bash
mongod
```

You should see:
```
"Waiting for connections on port 27017"
```

**Keep this terminal open!**

---

### 3. **Install Dependencies & Run App**

In a new terminal/PowerShell:

```bash
cd c:\Users\USER\Downloads\stockflow

# Install all packages (Firebase removed, MongoDB added)
npm install

# Start both backend server + frontend
npm run dev
```

You'll see both starting:
```
🚀 Stockflow API running on http://localhost:5000
✨ Vite dev server running...
Stockflow app running on http://localhost:3000
```

---

### 4. **Login & Test CRUD**

**Open**: http://localhost:3000

**Default Admin Credentials:**
- Email: `admin@stockflow.com`
- Password: `admin123`

---

## What Changed?

### ✅ **Removed**
- ❌ Firebase SDK
- ❌ Google OAuth login
- ❌ Firestore real-time listeners
- ❌ firebaseConfig.json references

### ✅ **Added**
- ✅ Express.js backend (Node.js)
- ✅ MongoDB database
- ✅ JWT authentication
- ✅ Admin email/password login
- ✅ REST API for CRUD

---

## File Structure

```
stockflow/
├── server.ts                 # Express backend (NEW)
├── .env                      # Environment variables (NEW)
├── .env.example              # Env template (NEW)
├── package.json              # Updated deps (MongoDB, Express)
├── src/
│   ├── App.tsx              # Updated - API-based auth
│   ├── services/
│   │   └── api.ts           # NEW - API client replacing Firebase
│   ├── components/
│   │   ├── InventoryDashboard.tsx  # Updated - Uses API
│   │   ├── AdminDashboard.tsx      # Updated - Uses API
│   │   └── ActivityLogs.tsx        # Updated - Uses API
│   └── types.ts             # Still works with MongoDB
└── firebase-applet-config.json  # NO LONGER USED
```

---

## Environment Variables

Located in `.env`:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/stockflow

# JWT Secret (change for production!)
JWT_SECRET=stockflow-dev-secret-key-change-production

# Admin Login
ADMIN_EMAIL=admin@stockflow.com
ADMIN_PASSWORD=admin123

# Server
PORT=5000
VITE_API_URL=http://localhost:5000
```

---

## Common Issues & Fixes

### ❌ "Cannot connect to MongoDB"
```
✓ Make sure MongoDB is running (mongod in another terminal)
✓ Try: mongod
✓ Or use Docker instead
```

### ❌ MongoDB server won't start on Windows
```
✓ Port 27017 already in use?
✓ Kill process: netstat -ano | findstr :27017
✓ taskkill /PID <PID> /F
```

### ❌ "ECONNREFUSED" when logging in
```
✓ Backend server not running?
✓ Run: npm run dev (starts both server & client)
✓ Check terminal for: 🚀 Stockflow API running...
```

### ❌ Cannot login with email/password
```
✓ Default: admin@stockflow.com / admin123
✓ Check .env for correct credentials
✓ Restart both server and client
```

---

## API Endpoints

### Authentication
```bash
POST /api/auth/login
  Body: { email, password }
  Returns: { token, email }

POST /api/auth/verify
  Headers: Authorization: Bearer <token>
```

### Products (Admin only for create/update/delete)
```bash
GET    /api/products              # Public read
GET    /api/products/:id          # Public read  
POST   /api/products              # Admin add
PATCH  /api/products/:id          # Admin edit
DELETE /api/products/:id          # Admin delete
```

### Activity Logs (Admin only)
```bash
GET    /api/logs                  # View all logs
```

---

## Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: "Product Name",           // Required
  category: "Electronics",        // Required
  quantity: 50,                   // >= 0
  status: "In Stock",             // enum
  price: 99.99,
  imageUrl: "...",
  tags: ["new", "featured"],
  createdAt: Date,
  updatedAt: Date,
  updatedBy: "admin@stockflow.com"
}
```

### Activity Logs Collection
```javascript
{
  _id: ObjectId,
  action: "create",               // create|update|delete
  productId: "...",
  productName: "Product Name",
  timestamp: Date,
  userEmail: "admin@stockflow.com",
  details: "Created product: ..."
}
```

---

## Performance Tips

1. **Polling Interval**: Currently set to 5 seconds
   - In `InventoryDashboard.tsx` line 45: `setInterval(fetchProducts, 5000)`
   - Decrease for faster updates, increase to reduce server load

2. **Pagination**: 100 items per page (adjust in component)

3. **MongoDB Indexing**: Automatically created for:
   - `updatedAt` (for sorting)
   - `status` (for filtering)

---

## Customization

### Change Admin Credentials
Edit `.env`:
```
ADMIN_EMAIL=yourname@company.com
ADMIN_PASSWORD=YourSecurePassword123
```

### Connect to MongoDB Atlas (Cloud)
Edit `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/stockflow?retryWrites=true&w=majority
```

### Deploy to Production
1. Set strong `JWT_SECRET` in .env
2. Use MongoDB Atlas (managed service)
3. Deploy backend to: Heroku, Railway, Render, etc.
4. Update `VITE_API_URL` to production backend URL

---

## Next Steps

1. ✅ Start MongoDB
2. ✅ Run `npm install`
3. ✅ Run `npm run dev`
4. ✅ Login with admin credentials
5. ✅ Test Create/Read/Update/Delete products

---

## Need Help?

Check logs in:
- **Backend**: Terminal running `npm run dev`
- **Frontend**: Browser console (F12 → Console)
- **MongoDB**: `mongod` terminal window

Happy building! 🚀
