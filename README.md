# 🗳️ E-Voting & Polling Mobile Application

## University Student Council Election System

A secure, transparent, and faculty-based electronic voting system for university student council elections and quick polls.

---

## 📱 Overview

This application provides a complete e-voting solution with:

- **Mobile App** (React Native - Android & iOS)
- **Web Admin Panel** (HTML/CSS/JavaScript)
- **Firebase Backend** (Authentication, Firestore, Storage)

### Key Features

✅ **Secure Authentication** - University ID-based registration  
✅ **Faculty-Based Access Control** - Students vote only in their faculty elections  
✅ **One Vote Per User** - Enforced at database level  
✅ **Elections System** - Formal candidate-based elections  
✅ **Polls System** - Quick opinion-based voting  
✅ **Admin Dashboard** - Complete management tools  
✅ **Automatic Results** - Real-time vote counting  
✅ **Offline Support** - Vote even without internet  
✅ **Audit Trail** - Transparent and tamper-resistant  

---

## 🎨 Design Theme

- **Primary Colors:** Black, White, Blue
- **UI Style:** Modern, Clean, Intuitive
- **Target Users:** University Students (18-25 years)

---

## 🏗️ Architecture

### Mobile App (React Native)
```
Students can:
├── Register with University ID
├── Login securely
├── Manage profile
├── Vote in elections (their faculty)
├── Vote in polls (their faculty)
└── View results (after closing)
```

### Admin Panel (Web)
```
Admins can:
├── Manage users
├── Create/edit elections
├── Manage candidates
├── Create/edit polls
├── View analytics
└── Generate reports
```

### Firebase Backend
```
Backend services:
├── Authentication (Email/Password)
├── Firestore Database
│   ├── Users
│   ├── Elections
│   ├── Candidates
│   ├── Votes
│   ├── Polls
│   ├── PollOptions
│   └── PollVotes
├── Storage (Images)
└── Security Rules (Access control)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- React Native CLI
- Firebase account
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Installation

See **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** for detailed setup guide.

### Quick Commands

```bash
# Install mobile app dependencies
cd mobile-app
npm install

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios

# Start admin panel (local server)
cd admin-panel
# Open index.html in browser or use live-server
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | Installation and configuration |
| [documentation/TECHNICAL_DOCUMENTATION.md](documentation/TECHNICAL_DOCUMENTATION.md) | System architecture and design |
| [documentation/DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md) | Database structure |
| [documentation/USER_GUIDE_STUDENT.md](documentation/USER_GUIDE_STUDENT.md) | Student user manual |
| [documentation/USER_GUIDE_ADMIN.md](documentation/USER_GUIDE_ADMIN.md) | Admin user manual |
| [documentation/SECURITY_GUIDE.md](documentation/SECURITY_GUIDE.md) | Security implementation |
| [documentation/DEPLOYMENT_GUIDE.md](documentation/DEPLOYMENT_GUIDE.md) | Deployment instructions |

---

## 🔒 Security Features

- **Firebase Authentication** with university credentials
- **Firestore Security Rules** prevent vote tampering
- **One-time voting** enforced at database level
- **Faculty-based access control** 
- **HTTPS encryption** for all communications
- **No admin vote modification** - results are read-only

---

## 📊 Database Schema

### Collections

1. **Users** - Student accounts
2. **Elections** - Formal elections
3. **Candidates** - Election candidates
4. **Votes** - Election votes (one per user per election)
5. **Polls** - Quick polls
6. **PollOptions** - Poll answer choices
7. **PollVotes** - Poll votes (one per user per poll)

See [DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md) for detailed structure.

---

## 🎯 User Roles

### 👨‍🎓 Students (Voters)
- Register with university ID
- Vote in elections (their faculty)
- Vote in polls (their faculty)
- View own profile
- View results after closing

### 👨‍💼 Admins
- Manage all users
- Create/manage elections
- Manage candidates
- Create/manage polls
- View all results
- Generate analytics

### 🎓 Candidates
- Students running in elections
- Appear in candidate lists
- Associated with specific faculty

---

## 🌐 Supported Platforms

### Mobile App
- ✅ Android 8.0+
- ✅ iOS 12.0+

### Admin Panel
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 📦 Dependencies

### Mobile App (React Native)
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `@react-native-firebase/storage`
- `@react-navigation/native`
- `react-native-image-picker`

### Admin Panel
- Firebase Web SDK v9 (CDN)
- Pure HTML/CSS/JavaScript (no frameworks)

---

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Firebase Storage
5. Add your Firebase config to:
   - `mobile-app/src/config/firebase.js`
   - `admin-panel/js/firebase-config.js`

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed steps.

---

## 🧪 Testing

### Test Users

Create test accounts for different faculties:

```
Email: engineering@test.edu
Password: Test123!
Faculty: Engineering

Email: medicine@test.edu
Password: Test123!
Faculty: Medicine
```

### Test Scenarios

1. ✅ Student registration
2. ✅ Login/logout
3. ✅ Vote in election
4. ✅ Attempt double voting (should fail)
5. ✅ Vote in wrong faculty election (should fail)
6. ✅ Vote in poll
7. ✅ View results
8. ✅ Admin create election
9. ✅ Admin view analytics

---

## 🚀 Deployment

### Mobile App
- **Android:** Generate APK/AAB and deploy to Google Play Store
- **iOS:** Build IPA and deploy to App Store

### Admin Panel
- Deploy to Firebase Hosting
- Or any static hosting service (Netlify, Vercel, etc.)

See [DEPLOYMENT_GUIDE.md](documentation/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🎓 Project Purpose

This is a **graduation project prototype** demonstrating:
- Secure e-voting implementation
- Firebase backend integration
- React Native mobile development
- Access control systems
- Data integrity and transparency

---

## 📝 License

This project is developed as an academic graduation project.

---

## 👥 Support

For questions or issues:
- Review the documentation in `/documentation/`
- Check Firebase logs for backend errors
- Review security rules configuration

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- React Native community
- University faculty for project guidance

---

**Built with ❤️ for secure, transparent, and accessible university elections**

---

*Last Updated: November 13, 2025*

