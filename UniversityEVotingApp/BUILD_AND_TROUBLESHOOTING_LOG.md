# University E-Voting App - Build & Troubleshooting Documentation

## Date: December 2, 2025

---

## 📱 Project Overview

A React Native mobile application for university student council elections and polls, using Firebase for authentication and data storage.

---

## 🛠️ Build Process

### Prerequisites
- Node.js >= 20
- Android Studio with emulator
- Java JDK (bundled with Android Studio at `C:\Program Files\Android\Android Studio\jbr`)
- Android SDK at `C:\Users\ASUS\AppData\Local\Android\Sdk`

### Build Commands

```powershell
# Navigate to project
cd "D:\Wazar Project\UniversityEVotingApp"

# Install dependencies
npm install

# Set environment variables (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Build APK
cd android
.\gradlew.bat assembleDebug

# APK location
# D:\Wazar Project\UniversityEVotingApp\android\app\build\outputs\apk\debug\app-debug.apk
```

### Install on Emulator

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

# Uninstall old version
& $adb uninstall com.universityevotingapp

# Install new APK
& $adb install "D:\Wazar Project\UniversityEVotingApp\android\app\build\outputs\apk\debug\app-debug.apk"

# Set up port forwarding for Metro
& $adb reverse tcp:8081 tcp:8081
```

### Start Metro Bundler

```powershell
cd "D:\Wazar Project\UniversityEVotingApp"
npx react-native start

# With cache reset (if having issues)
npx react-native start --reset-cache
```

---

## 🐛 Issues Encountered & Solutions

### Issue 1: "Unable to load script" Error
**Cause:** Metro bundler not running or not connected to emulator.

**Solution:**
1. Start Metro: `npx react-native start`
2. Set up port forwarding: `adb reverse tcp:8081 tcp:8081`
3. Reload app in emulator (tap R, R)

---

### Issue 2: "RNGestureHandlerModule could not be found"
**Cause:** Native gesture handler module not compiled into APK.

**Solution:**
1. Install gesture handler: `npm install react-native-gesture-handler`
2. Add import at TOP of `index.js`:
   ```javascript
   import 'react-native-gesture-handler';
   ```
3. Rebuild APK: `.\gradlew.bat assembleDebug`

---

### Issue 3: "Cannot read property 'create' of undefined"
**Cause:** Multiple issues including Firebase not initialized and problematic imports.

**Solution:**
- See Issue 4 (Firebase) and Issue 5 (Screen imports)

---

### Issue 4: "No Firebase App '[DEFAULT]' has been created"
**Cause:** Two problems:
1. Wrong package name in `google-services.json`
2. Missing google-services Gradle plugin

**Solution:**

#### Fix 1: Correct package name in google-services.json
File: `android/app/google-services.json`
```json
{
  "client": [{
    "client_info": {
      "android_client_info": {
        "package_name": "com.universityevotingapp"  // Must match app's applicationId
      }
    }
  }]
}
```

#### Fix 2: Add google-services plugin
File: `android/build.gradle`
```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath("com.google.gms:google-services:4.4.2")  // ADD THIS
    }
}
```

File: `android/app/build.gradle` (at the end)
```gradle
// ... existing content

apply plugin: 'com.google.gms.google-services'  // ADD THIS AT END
```

Then rebuild APK.

---

### Issue 5: Problematic Screen Imports Causing Crashes
**Cause:** Some screen files had issues that caused "Cannot read property 'create'" errors during module loading.

**Solution:** 
Created inline screen components in `App.js` instead of importing from external files. The working App.js structure:

```javascript
// App.js - Working structure
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Only import screens that work
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';

// Define other screens inline in App.js
const ElectionsScreen = ({ navigation }) => { /* inline implementation */ };
const PollsScreen = ({ navigation }) => { /* inline implementation */ };
const ProfileScreen = ({ navigation }) => { /* inline implementation */ };
```

---

### Issue 6: Login Fails with "Invalid Credentials"
**Cause:** Multiple issues:
1. Spaces in University ID created invalid email (e.g., "john doe@university.edu")
2. User typing wrong University ID (typos like EGN3 vs ENG3)

**Solution:**

#### Fix spaces in authService.js:
```javascript
// Registration
const cleanId = universityId.toLowerCase().replace(/\s+/g, '').trim();
const email = `${cleanId}@university.edu`;

// Login (same fix)
const cleanId = universityId.toLowerCase().replace(/\s+/g, '').trim();
const email = `${cleanId}@university.edu`;
```

#### User guidance:
- Login with the EXACT University ID used during registration
- University ID field is for the ID (e.g., "ENG001"), not the user's name

---

### Issue 7: Navigation Error After Registration
**Error:** "The action 'NAVIGATE' with payload {"name":"Login"} was not handled"

**Cause:** After successful registration, code tried to navigate to "Login" screen, but user was already logged in (Firebase auto-login after registration), so AuthStack was replaced by AppStack.

**Solution:** Remove navigation after registration in `RegisterScreen.js`:
```javascript
if (result.success) {
  Alert.alert(
    'Registration Successful',
    'Your account has been created successfully! You are now logged in.',
    [{ text: 'OK' }]  // No navigation - App.js handles it
  );
}
```

---

### Issue 8: Emulator Storage Full
**Error:** "INSTALL_FAILED_INSUFFICIENT_STORAGE"

**Solution:**
```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb uninstall com.universityevotingapp
& $adb shell pm clear com.android.providers.downloads
& $adb shell rm -rf /data/local/tmp/*
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `App.js` | Main app component with navigation |
| `index.js` | Entry point (must import gesture-handler first) |
| `src/config/firebase.js` | Firebase configuration and exports |
| `src/services/authService.js` | Authentication logic |
| `src/screens/Auth/LoginScreen.js` | Login UI |
| `src/screens/Auth/RegisterScreen.js` | Registration UI |
| `android/app/google-services.json` | Firebase Android config |
| `android/build.gradle` | Root Gradle config |
| `android/app/build.gradle` | App Gradle config |

---

## 🔑 Password Requirements

The app requires passwords with:
- At least 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

Example valid password: `Password123`

---

## 🔥 Firebase Configuration

**Project:** universityevoting2
**Package Name:** com.universityevotingapp

The email format for users is: `{universityId}@university.edu`
- Example: University ID `ENG001` → Email `eng001@university.edu`

---

## 📦 Key Dependencies

```json
{
  "@react-native-firebase/app": "^23.5.0",
  "@react-native-firebase/auth": "^23.5.0",
  "@react-native-firebase/firestore": "^23.5.0",
  "@react-navigation/native": "^7.1.19",
  "@react-navigation/native-stack": "^7.8.3",
  "react-native-gesture-handler": "^2.29.1",
  "react-native-screens": "^4.18.0"
}
```

---

## ✅ Working Features

- [x] User Registration
- [x] User Login/Logout
- [x] View Elections (from Firestore)
- [x] View Polls (from Firestore)
- [x] View User Profile
- [x] Firebase Authentication
- [x] Firestore Database Integration

---

## 🚀 Quick Start After Restart

1. Open Android Studio and start emulator
2. Open terminal in `D:\Wazar Project\UniversityEVotingApp`
3. Run: `npx react-native start`
4. In another terminal: `adb reverse tcp:8081 tcp:8081`
5. Install APK or run: `npx react-native run-android`

---

## 📝 Notes

- The app uses React Navigation 7 with Native Stack Navigator
- Bottom tabs were removed due to compatibility issues; using menu-based navigation instead
- Always rebuild APK after changing native files (gradle, google-services.json, etc.)
- Use `--reset-cache` with Metro if JavaScript changes aren't reflecting

---

*Documentation created: December 2, 2025*

