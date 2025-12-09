# 🔄 Instructions After Laptop Restart

## Simple Steps to Build Your APK

---

## ✅ **Step 1: Restart Your Laptop**

1. **Close everything:**
   - Close all browsers
   - Close Android Studio
   - Close VS Code
   - Close Command Prompt windows
   
2. **Restart Windows**

3. **Wait for laptop to fully boot up**

---

## ✅ **Step 2: Make Sure google-services.json is in Place**

Before running the build, verify this file exists:

**File location:** `D:\Wazar Project\UniversityEVotingApp\android\app\google-services.json`

**If it's NOT there:**
1. Go to Downloads folder
2. Find `google-services.json`
3. Copy it to: `D:\Wazar Project\UniversityEVotingApp\android\app\`

---

## ✅ **Step 3: Run the Build Script**

1. **Open File Explorer**
2. Navigate to: `D:\Wazar Project\`
3. Find the file: **`BUILD_APK.bat`**
4. **Right-click** on it
5. Click **"Run as administrator"** (important!)
6. A black window will open

---

## ✅ **Step 4: Wait for Build to Complete**

You'll see:

```
[Step 1/4] Checking dependencies...
[Step 2/4] Dependencies installed!
[Step 3/4] Building APK... This takes 10-15 minutes!
```

**DO NOT close the window!**

Just wait. You'll see lots of text scrolling.

---

## ✅ **Step 5: Success!**

When done, you'll see:

```
================================================
BUILD SUCCESSFUL!
================================================

Your APK file is located at:
D:\Wazar Project\UniversityEVotingApp\android\app\build\outputs\apk\debug\app-debug.apk
```

**A folder will automatically open with your APK file!**

---

## ✅ **Step 6: Install on Your Phone**

### **Method 1: USB Transfer**
1. Connect phone to laptop with USB cable
2. Copy `app-debug.apk` to phone
3. On phone, find the file and tap it
4. Tap "Install"
5. Done!

### **Method 2: Cloud Transfer**
1. Upload APK to Google Drive / OneDrive
2. Download on phone
3. Install

### **Method 3: Email**
1. Email the APK to yourself
2. Open email on phone
3. Download and install

---

## 🎯 **If Build Fails:**

If you see "BUILD FAILED", don't worry! Try this:

1. **Open Android Studio**
2. Click **"Open"**
3. Select: `D:\Wazar Project\UniversityEVotingApp\android`
4. Wait for Gradle sync
5. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
6. Wait for it to build in Android Studio

Android Studio handles dependencies better than command line.

---

## 💡 **Why Restart Helps:**

- Frees up memory
- Clears stuck processes
- Gives build maximum resources
- Fresh start often fixes mysterious errors

---

**After restart, just run BUILD_APK.bat and wait!**

Good luck! 🚀

