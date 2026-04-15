#!/usr/bin/env node

/**
 * Admin Setup Script
 * 
 * This script sets up an admin user in Firestore.
 * Run this after logging in with your Google account once.
 * 
 * Usage:
 * 1. Run: npm run setup-admin
 * 2. Follow the prompts to add your user as admin
 * 
 * IMPORTANT: You must have logged in at least once via the app before running this.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Read Firebase config
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ firebase-applet-config.json not found');
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => {
  rl.question(prompt, resolve);
});

async function setupAdmin() {
  console.log('\n🔐 StockFlow Admin Setup\n');
  console.log('This script will add your user as an admin in Firestore.');
  console.log('You must be logged in with your Google account first.\n');

  const action = await question('Do you want to:\n1. Login with Google and add as admin\n2. Add an existing user as admin (by email)\n\nEnter 1 or 2: ');

  if (action === '1') {
    // Login flow
    console.log('\n📱 Opening login popup...');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      
      if (!user.uid || !user.email || !user.displayName) {
        console.error('❌ Failed to get user information');
        process.exit(1);
      }

      await createAdminUser(user.uid, user.email, user.displayName, user.email);
      console.log(`\n✅ ${user.email} has been added as admin!`);
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  } else if (action === '2') {
    // Manual admin addition
    const userId = await question('\nEnter the user\'s Firebase UID: ');
    const email = await question('Enter the user\'s email: ');
    const displayName = await question('Enter the user\'s display name: ');
    const currentAdmin = await question('Your email (current admin granting access): ');

    if (!userId || !email || !displayName || !currentAdmin) {
      console.error('❌ All fields are required');
      process.exit(1);
    }

    try {
      await createAdminUser(userId, email, displayName, currentAdmin);
      console.log(`\n✅ ${email} has been added as admin!`);
    } catch (error) {
      console.error('❌ Failed to add admin:', error);
    }
  } else {
    console.error('❌ Invalid option');
  }

  rl.close();
  process.exit(0);
}

async function createAdminUser(uid, email, displayName, grantedBy) {
  const adminDocRef = doc(db, 'admins', uid);
  
  try {
    await setDoc(adminDocRef, {
      uid,
      email,
      displayName,
      createdAt: Timestamp.now(),
      grantedBy
    });
  } catch (error) {
    throw new Error(`Failed to create admin document: ${error}`);
  }
}

setupAdmin().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
