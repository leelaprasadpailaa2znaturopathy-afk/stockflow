# StockFlow Local Setup Guide

## ✅ NO API KEYS REQUIRED!

This app runs completely locally without any external API keys or paid services.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** (optional, for cloning the repo)
- **Google Account** - For Firebase authentication only (free tier)

## Step 1: Environment Setup (OPTIONAL)

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. No changes needed! The file is pre-configured for local development.

That's it! No API key configuration needed. ✨

## Step 2: Install and Run

```bash
npm install
npm run dev
```

You should see output like:
```
  ✓ built in 2.34s

  ➜  Local:   http://localhost:3000
  ➜  press h to show help
```

Open your browser to `http://localhost:3000`

## Step 3: Setup Admin Access

### Option A: Using the Setup Script (Recommended)

1. First, login to the app with your Google account:
   - Click **"Admin Login"** button
   - Complete Google OAuth flow
   - You'll be logged in as a Viewer

2. Run the admin setup script:
   ```bash
   npm run setup-admin
   ```

3. Select option "1. Login with Google and add as admin"
   - You'll be prompted to login again
   - After login, you'll automatically become an admin

4. Refresh the app - you should now see **"Manage"** and **"Logs"** tabs

### Option B: Manual Firestore Setup

If the script doesn't work, manually add yourself as admin:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Data** tab
4. Create a new collection named `admins`
5. Create a new document with:
   - **Document ID**: Your Firebase UID (get from the app's browser console after login - copy value after `auth.currentUser.uid`)
   - **Fields**:
     ```
     uid: (same as document ID)
     email: your-email@gmail.com
     displayName: Your Name
     createdAt: (server timestamp)
     grantedBy: (your email or "manual-setup")
     ```

6. Refresh the app - you should now see admin tabs

## Step 4: Test the Application

1. **Login**: Click "Admin Login" and complete Google OAuth
2. **Add Product**: Go to "Manage" tab → "Add Product" button
3. **Test Enrichment**: 
   - In product form, enter:
     - Product Name: "iPhone 15"
     - Category: "Electronics"
   - Click "Enrich with Details"
   - Realistic data generates instantly (size, price, image, date)
4. **Create Product**: Click "Save" to create
5. **View Logs**: Go to "Logs" tab to see activity

## Troubleshooting

### "GEMINI_API_KEY is not defined"
- **Problem**: Error message about missing API key
- **Solution**: 
  - You shouldn't see this! App no longer needs any API key.
  - If you do, clear browser cache and restart: `npm run dev`
  - Verify [vite.config.ts](vite.config.ts) doesn't have GEMINI_API_KEY define

### "Login failed" or "undefined is not a function"
- **Problem**: Firebase not configured
- **Solution**:
  - Check `firebase-applet-config.json` exists
  - Verify it has valid Firebase credentials
  - Clear browser cache and reload

### "Admin Dashboard not visible"
- **Problem**: Not marked as admin in Firestore
- **Solution**: 
  - Check browser console after login: `auth.currentUser.uid` should show your UID
  - Verify your UID is in Firestore `admins` collection
  - Run admin setup script again

### "AI Enrichment not working"
- **Problem**: Enrichment button doesn't generate data
- **Solution**: 
  - App now uses local enrichment (always works!)
  - Make sure you select a category from the dropdown
  - Check browser console for any errors

### "Firestore errors in console"
- **Problem**: Database connection issues
- **Solution**:
  - Verify `firebase-applet-config.json` has correct projectId
  - Check Firebase project is accessible
  - Verify Firestore security rules are deployed
  - Go to Firebase Console → Firestore → Rules tab and click "Publish"

## Development Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run clean    # Remove dist folder
npm run lint     # Run TypeScript type checking
npm run setup-admin  # Add user as admin
```

## Next Steps

- **Production Build**: See [Deployment Guide](DEPLOYMENT.md)
- **Adding More Admins**: Run `npm run setup-admin` again with their details
- **Customization**: Edit components in `src/components/`
- **Add Features**: Extend types in `src/types.ts` and add to Firestore

## Need Help?

1. Check browser console (F12) for error messages
2. Check server console for logs
3. Review [Firebase Docs](https://firebase.google.com/docs)
4. Check [Gemini API Docs](https://ai.google.dev/docs)
