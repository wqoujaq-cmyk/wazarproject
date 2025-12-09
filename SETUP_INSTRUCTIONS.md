# 🚀 Setup Instructions - E-Voting Application

## Complete Installation and Configuration Guide

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Admin Panel Setup](#admin-panel-setup)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **React Native CLI** - Install with: `npm install -g react-native-cli`
- **Git** (optional) - [Download](https://git-scm.com/)

### For Android Development
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Java Development Kit (JDK)** 11 or higher
- Android SDK (installed with Android Studio)
- Android Virtual Device (AVD) or physical device

### For iOS Development (macOS only)
- **Xcode** 12+ - [Download from App Store](https://apps.apple.com/app/xcode/id497799835)
- CocoaPods - Install with: `sudo gem install cocoapods`
- iOS Simulator or physical device

### Firebase Account
- Create a free account at [Firebase Console](https://console.firebase.google.com)

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `university-evoting` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules later)
4. Choose your database location (closest to your users)
5. Click **Enable**

### Step 4: Enable Firebase Storage

1. Go to **Storage** in Firebase Console
2. Click **"Get started"**
3. Use default security rules (we'll update later)
4. Choose the same location as your Firestore database
5. Click **Done**

### Step 5: Register Android App

1. In Firebase Console, click the **Android icon** to add an Android app
2. **Android package name:** `com.universityevoting` (or your choice)
3. **App nickname:** `E-Voting Android`
4. Click **"Register app"**
5. Download `google-services.json`
6. Save it for later (you'll place it in `mobile-app/android/app/`)

### Step 6: Register iOS App (if building for iOS)

1. Click the **iOS icon** to add an iOS app
2. **iOS bundle ID:** `com.universityevoting` (must match Android)
3. **App nickname:** `E-Voting iOS`
4. Click **"Register app"**
5. Download `GoogleService-Info.plist`
6. Save it for later (you'll place it in `mobile-app/ios/`)

### Step 7: Get Web Configuration

1. Click the **Web icon** (</>) to add a web app
2. **App nickname:** `Admin Panel`
3. Click **"Register app"**
4. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};
```

5. Save this configuration (you'll use it in both mobile and admin panel)

---

## Mobile App Setup

### Step 1: Create React Native Project

```bash
# Navigate to the project directory
cd "D:/Wazar Project"

# Create the mobile app
npx react-native init UniversityEVoting --template react-native-template-typescript

# Rename the folder to mobile-app
mv UniversityEVoting mobile-app

# Navigate into the project
cd mobile-app
```

### Step 2: Install Dependencies

```bash
# Install React Native Firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/storage

# Install Navigation
npm install @react-navigation/native
npm install @react-navigation/stack
npm install @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# Install Image Picker
npm install react-native-image-picker

# Install other utilities
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons

# For iOS only (skip if not building for iOS)
cd ios && pod install && cd ..
```

### Step 3: Configure Firebase for Android

1. Place the `google-services.json` file you downloaded earlier into:
   ```
   mobile-app/android/app/google-services.json
   ```

2. Edit `mobile-app/android/build.gradle`:
   ```gradle
   buildscript {
     dependencies {
       // Add this line
       classpath 'com.google.gms:google-services:4.3.15'
     }
   }
   ```

3. Edit `mobile-app/android/app/build.gradle`:
   ```gradle
   // Add at the bottom of the file
   apply plugin: 'com.google.gms.google-services'
   ```

### Step 4: Configure Firebase for iOS (macOS only)

1. Place the `GoogleService-Info.plist` file into:
   ```
   mobile-app/ios/GoogleService-Info.plist
   ```

2. Open `mobile-app/ios/UniversityEVoting.xcworkspace` in Xcode
3. Drag `GoogleService-Info.plist` into the project (check "Copy items if needed")

### Step 5: Create Firebase Configuration

Create `mobile-app/src/config/firebase.js`:

```javascript
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (already initialized by @react-native-firebase)
// Just export the instances
export { auth, firestore, storage };
export default firebaseConfig;
```

### Step 6: Run the Mobile App

```bash
# For Android
npx react-native run-android

# For iOS (macOS only)
npx react-native run-ios
```

---

## Admin Panel Setup

### Step 1: Create Admin Panel Structure

```bash
# From the project root
cd "D:/Wazar Project"

# Create admin panel directory
mkdir admin-panel
cd admin-panel

# Create subdirectories
mkdir css js assets
```

### Step 2: Configure Firebase for Web

Create `admin-panel/js/firebase-config.js`:

```javascript
// Firebase Web SDK v9 (modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
```

### Step 3: Run Admin Panel Locally

#### Option 1: Using Live Server (Recommended)

```bash
# Install live-server globally
npm install -g live-server

# From admin-panel directory
cd admin-panel
live-server
```

#### Option 2: Using Python

```bash
# Python 3
cd admin-panel
python -m http.server 8000

# Then open: http://localhost:8000
```

#### Option 3: Using Node.js http-server

```bash
# Install http-server
npm install -g http-server

# Run from admin-panel directory
cd admin-panel
http-server
```

#### Option 4: Direct File Opening

Simply open `admin-panel/index.html` in your browser (may have CORS issues with Firebase)

---

## Firebase Security Rules Setup

### Step 1: Deploy Firestore Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Copy the contents from `firebase/firestore.rules` (will be created in next steps)
3. Click **Publish**

### Step 2: Deploy Storage Rules

1. In Firebase Console, go to **Storage** → **Rules**
2. Copy the contents from `firebase/storage.rules`
3. Click **Publish**

---

## Testing

### Create Test Admin Account

1. Go to Firebase Console → **Authentication** → **Users**
2. Click **"Add user"**
3. Email: `admin@university.edu`
4. Password: `Admin123!`
5. Click **"Add user"**
6. Go to **Firestore Database**
7. Create a document in the `Users` collection:
   ```
   Collection: Users
   Document ID: [the UID from Authentication]
   Fields:
     - name: "Admin User"
     - university_id: "ADMIN001"
     - faculty: "Administration"
     - major: "Administration"
     - role: "admin"
     - is_active: true
     - created_at: [current timestamp]
   ```

### Create Test Student Account

Use the mobile app's registration screen to create test students, or manually add to Firebase:

```
Email: student@university.edu
Password: Student123!

Fields in Users collection:
  - name: "Test Student"
  - university_id: "ENG001"
  - faculty: "Engineering"
  - major: "Computer Science"
  - role: "voter"
  - is_active: true
  - created_at: [current timestamp]
```

---

## Troubleshooting

### Common Issues

#### Issue: "Unable to resolve module @react-native-firebase/app"
**Solution:**
```bash
cd mobile-app
npm install
cd ios && pod install && cd .. (iOS only)
npx react-native run-android (or run-ios)
```

#### Issue: Android build fails with "google-services.json not found"
**Solution:**
- Ensure `google-services.json` is in `mobile-app/android/app/`
- Verify you added the Google Services plugin to `build.gradle`

#### Issue: Firebase not initialized in mobile app
**Solution:**
- Check that Firebase config is correct in `src/config/firebase.js`
- Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) are in correct locations

#### Issue: Admin panel shows CORS errors
**Solution:**
- Use a local web server (live-server, http-server) instead of opening HTML directly
- Or deploy to Firebase Hosting

#### Issue: Cannot authenticate in admin panel
**Solution:**
- Verify Firebase config in `js/firebase-config.js`
- Check that Authentication is enabled in Firebase Console
- Ensure admin user has `role: "admin"` in Firestore Users collection

### Firebase Console Useful Links

- **Authentication:** https://console.firebase.google.com/project/YOUR_PROJECT/authentication
- **Firestore:** https://console.firebase.google.com/project/YOUR_PROJECT/firestore
- **Storage:** https://console.firebase.google.com/project/YOUR_PROJECT/storage
- **Project Settings:** https://console.firebase.google.com/project/YOUR_PROJECT/settings/general

---

## Next Steps

After successful setup:

1. ✅ Test mobile app registration and login
2. ✅ Test admin panel login
3. ✅ Create a test election in admin panel
4. ✅ Vote in the election from mobile app
5. ✅ View results in admin panel

---

## Environment Variables (Optional)

For production, consider using environment variables:

### Mobile App (.env file)

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

Install `react-native-config`:
```bash
npm install react-native-config
```

---

## Support

If you encounter issues not covered here:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review [React Native Firebase Documentation](https://rnfirebase.io/)
3. Check Firebase Console logs for errors

---

**Setup Complete!** 🎉

You're now ready to start developing and testing the E-Voting application.

---

*Last Updated: November 13, 2025*

