# StockFlow - Inventory Management System

A real-time inventory management application powered by Firebase and AI-driven product enrichment using Google's Gemini API.

**Status**: ✅ Production Ready

## 🚀 Quick Start

### Local Development (5 minutes)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment** (OPTIONAL - pre-configured):
   ```bash
   cp .env.example .env.local
   # No API keys needed! App is ready to run.
   ```

3. **Run the app**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Visit `http://localhost:3000`
   - Click "Admin Login" and authenticate with Google

5. **Setup admin access** (2 minutes):
   ```bash
   npm run setup-admin
   ```

Full local setup guide: See [SETUP.md](SETUP.md)

## 📋 Documentation

- **[SETUP.md](SETUP.md)** - Complete local development setup (5-10 min)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide for VPS/Docker
- **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** - Technical review results and improvements
- **.env.example** - Environment variables reference with documentation

## ✨ Features

### User Dashboard
- ✅ Real-time inventory view
- ✅ Search and filter products
- ✅ Public read access (no login required)

### Admin Dashboard (Login Required)
- ✅ Create, edit, delete products
- ✅ Bulk import CSV/JSON with validation
- ✅ AI-powered product enrichment (name + category → full details)
- ✅ Activity logging (immutable audit trail)

### AI Integration
- ✅ Local product enrichment (no API key needed)
- ✅ Suggests size, price, image URL, launch date
- ✅ Based on product category and market data
- ✅ Works completely offline

### Activity Logs
- ✅ Track all create/update/delete operations
- ✅ User email and timestamp for each action
- ✅ Admin-only visibility
- ✅ Immutable records (cannot delete logs)

### Authentication
- ✅ Google OAuth login
- ✅ Dynamic admin role system (Firestore-based)
- ✅ Unlimited admin users
- ✅ Easy admin setup via CLI

## 🎯 Architecture

```
Frontend (React 19 + TypeScript)
    ↓
Firebase Auth (Google OAuth)
    ↓
Firestore Database (Real-time Sync)
    ↓
Gemini API (AI Enrichment)
```

**Collections**:
- `admins` - Admin user management
- `products` - Inventory data
- `logs` - Activity audit trail

## 🔧 Available Commands

```bash
npm run dev         # Start dev server (port 3000)
npm run build       # Build for production
npm run preview     # Preview production build
npm run clean       # Remove dist folder
npm run lint        # Run TypeScript checks
npm run setup-admin # Add user as admin
```

## 🚢 Deployment

### Option 1: Docker (Recommended)
```bash
docker build -t stockflow .
docker run -e GEMINI_API_KEY=your_key -p 3000:3000 stockflow
```

### Option 2: VPS with nginx + systemd
See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.

### Option 3: Cloud Run
- Dockerfile included, ready to deploy
- Configure Secrets in Cloud Run console

Full deployment guide: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 📦 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Google Gemini API
- **Build**: Vite 6
- **UI Components**: shadcn/ui (12 components)
- **Build Tool**: Docker, systemd, nginx

## 🔐 Security

- ✅ Firestore security rules enforce admin-only writes
- ✅ Google OAuth for authentication
- ✅ Activity logs immutable (audit trail)
- ✅ Environment variables never committed
- ✅ Email-verified admin check

## 📖 Getting Started for First-Time Users

1. **First Time Setup** (10 minutes):
   - Follow [SETUP.md](SETUP.md)
   - Get GEMINI_API_KEY from [Google AI Studio](https://aistudio.google.com/)
   - Run `npm run setup-admin` to become admin

2. **Test the App** (5 minutes):
   - Add a product manually
   - Test AI enrichment with product name + category
   - Check "Logs" tab to see activity

3. **Deploy to Production** (15 minutes):
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
   - Choose Docker or VPS deployment
   - Setup HTTPS/SSL with certbot

## ❓ Troubleshooting

**Issue**: Login fails  
**Solution**: Check Firebase config in browser console  

**Issue**: Admin Dashboard not visible  
**Solution**: Run `npm run setup-admin` and refresh

**Issue**: AI Enrichment fails  
**Solution**: Verify GEMINI_API_KEY is valid and in `.env.local`

For more troubleshooting, see [SETUP.md](SETUP.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini API Guide](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

Apache License 2.0

---

**Ready to get started?** → Check out [SETUP.md](SETUP.md) for local development or [DEPLOYMENT.md](DEPLOYMENT.md) for production.
