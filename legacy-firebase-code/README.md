# Legacy Firebase Code

This folder contains outdated Firebase-based code and documentation from the project's initial development phase.

## Migration Status

✅ **COMPLETE** - Project has been fully migrated from Firebase to MongoDB Atlas with Express.js backend.

## Files in this Archive

### Old Configuration Files
- `firebase-applet-config.json` - Firebase authentication config (replaced by JWT + MongoDB)
- `firebase-blueprint.json` - Firebase/Firestore blueprint (no longer needed)
- `firestore.rules` - Old Firestore security rules (not used)

### Old Source Code
- `src/firebase.ts` - Firebase initialization code (replaced by `/src/services/api.ts`)
- `src/services/geminiService.ts` - Old Gemini AI integration (if still needed, should be updated)

### Old Documentation
- `FIREBASE_CRUD_FIX.md` - How Firebase CRUD was fixed (historical)
- `FIREBASE_VS_MONGODB.md` - Comparison guide between Firebase and MongoDB (reference only)
- `MIGRATION_GUIDE.md` - MongoDB migration guide (reference)
- Other `.md` files - Setup guides from Firebase era

## Current Architecture

**Backend:**
- Express.js + Node.js on port 8080
- MongoDB Atlas cloud database
- JWT token-based authentication
- REST API endpoints for CRUD operations

**Frontend:**
- React 19 + Vite on port 3001
- API client service: `/src/services/api.ts`
- Component authentication replaced with email/password login

**Database:**
- MongoDB Atlas (cloud)
- Collections: `products`, `activitylogs`

**Authentication:**
- Admin credentials: email/password
- JWT tokens for session management
- No Google OAuth (removed as requested)

## If You Need to Reference Old Code

1. **Authentication Flow:** See `src/App.tsx` for current email/password login
2. **API Calls:** See `src/services/api.ts` for all backend communication
3. **Product Management:** See `src/components/AdminDashboard.tsx`
4. **Inventory Display:** See `src/components/InventoryDashboard.tsx`

## Do Not Use

The files in this folder should NOT be imported or used in the current application. They are kept for historical reference only.

To fully clean up the project:
- Remove `/src/firebase.ts` if not needed
- Remove `/src/services/geminiService.ts` if Gemini integration not in use
- Delete this legacy folder if space is a concern

---

**Archive Date:** 2025-01-15
**Migration Status:** Complete
