# Technical Documentation

## E-Voting & Polling Mobile Application

**Version:** 1.0.0  
**Last Updated:** November 13, 2025

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Data Flow](#data-flow)
5. [Security Implementation](#security-implementation)
6. [API Reference](#api-reference)
7. [Deployment](#deployment)

---

## 1. System Architecture

### Overview

The E-Voting system follows a three-tier architecture:

```
┌─────────────────────────────────────────┐
│         Client Applications             │
├──────────────────┬──────────────────────┤
│   Mobile App     │    Admin Panel       │
│  (React Native)  │  (HTML/CSS/JS)       │
└──────────────────┴──────────────────────┘
           │                  │
           └─────────┬────────┘
                     ▼
         ┌───────────────────────┐
         │    Firebase Backend   │
         ├───────────────────────┤
         │  - Authentication     │
         │  - Cloud Firestore    │
         │  - Firebase Storage   │
         │  - Security Rules     │
         └───────────────────────┘
```

### Components

#### Mobile Application (React Native)
- **Purpose:** Student-facing voting interface
- **Platforms:** Android & iOS
- **Key Features:**
  - User registration and authentication
  - Election browsing and voting
  - Poll participation
  - Results viewing
  - Profile management

#### Admin Panel (Web)
- **Purpose:** Administrative interface for managing the system
- **Platform:** Web browser
- **Key Features:**
  - Dashboard with analytics
  - User management
  - Election CRUD operations
  - Candidate management
  - Poll management
  - Results and analytics

#### Firebase Backend
- **Authentication:** Email/password authentication
- **Database:** Cloud Firestore for structured data
- **Storage:** Firebase Storage for images
- **Security:** Firestore security rules

---

## 2. Technology Stack

### Mobile Application

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native | 0.72.0 |
| Language | JavaScript | ES6+ |
| Navigation | React Navigation | 6.x |
| State Management | React Hooks | - |
| Firebase SDK | @react-native-firebase | 18.0.0 |
| Image Picker | react-native-image-picker | 5.6.0 |

### Admin Panel

| Component | Technology |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Firebase SDK | Firebase Web SDK v9 (modular) |
| Styling | Custom CSS |
| HTTP | Fetch API |

### Backend (Firebase)

| Service | Purpose |
|---------|---------|
| Firebase Authentication | User authentication |
| Cloud Firestore | Primary database |
| Firebase Storage | Image storage |
| Security Rules | Access control |
| (Optional) Cloud Functions | Server-side logic |

---

## 3. Application Structure

### Mobile App Structure

```
mobile-app/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── screens/
│   │   ├── Auth/                # Authentication screens
│   │   ├── Profile/             # Profile management
│   │   ├── Elections/           # Election voting
│   │   ├── Polls/               # Poll voting
│   │   └── Results/             # Results viewing
│   ├── components/
│   │   ├── common/              # Reusable components
│   │   ├── elections/           # Election-specific components
│   │   └── polls/               # Poll-specific components
│   ├── services/
│   │   ├── authService.js       # Authentication logic
│   │   ├── userService.js       # User operations
│   │   ├── electionService.js   # Election operations
│   │   └── pollService.js       # Poll operations
│   ├── hooks/                   # Custom React hooks
│   ├── navigation/              # Navigation configuration
│   ├── styles/
│   │   ├── colors.js            # Theme colors
│   │   └── globalStyles.js      # Global styles
│   └── utils/
│       ├── validation.js        # Form validation
│       └── helpers.js           # Utility functions
├── App.js                       # Main app component
└── package.json                 # Dependencies
```

### Admin Panel Structure

```
admin-panel/
├── index.html                   # Main dashboard
├── css/
│   └── admin-styles.css         # Styling
├── js/
│   ├── firebase-config.js       # Firebase configuration
│   ├── auth.js                  # Admin authentication
│   ├── users.js                 # User management
│   ├── elections.js             # Election management
│   ├── candidates.js            # Candidate management
│   ├── polls.js                 # Poll management
│   └── results.js               # Results & analytics
└── assets/                      # Static assets
```

---

## 4. Data Flow

### Election Voting Flow

```
1. User Login
   ↓
2. Fetch Active Elections (filtered by faculty)
   ↓
3. User Selects Election
   ↓
4. Fetch Candidates (for user's faculty)
   ↓
5. User Selects Candidate
   ↓
6. Confirmation Screen
   ↓
7. Validate (hasn't voted, election active)
   ↓
8. Create Vote Document
   ↓
9. Success (redirect to elections list)
```

### Security Checks

At each step:
- **Authentication:** User must be logged in
- **Faculty Check:** User's faculty must match election scope
- **Time Check:** Current time within election window
- **Vote Check:** User hasn't already voted
- **Active Status:** User account is active

---

## 5. Security Implementation

### Authentication Security

- Email/password authentication via Firebase Auth
- University ID mapped to email format: `{universityId}@university.edu`
- Passwords hashed and stored securely by Firebase
- Session management via Firebase Auth tokens

### Firestore Security Rules

#### Key Principles:
1. **Read Access:** Users can read their own data and public data
2. **Write Access:** Strictly controlled
3. **Vote Immutability:** Votes cannot be updated or deleted
4. **One Vote Rule:** Enforced at database level

#### Example Rules:

```javascript
// Users can only read their own profile
match /Users/{userId} {
  allow read: if request.auth.uid == userId;
  allow update: if request.auth.uid == userId 
                && request.resource.data.role == resource.data.role;
}

// Votes are immutable and one per user per election
match /Votes/{voteId} {
  allow create: if request.auth.uid == request.resource.data.user_id
                && !exists(/databases/$(database)/documents/Votes/$(request.auth.uid + '_' + request.resource.data.election_id));
  allow update, delete: if false;
}
```

### Storage Security Rules

```javascript
// Profile pictures: users can upload their own
match /profilePictures/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId 
               && request.resource.size < 5 * 1024 * 1024
               && request.resource.contentType.matches('image/.*');
}
```

---

## 6. API Reference

### Authentication Service

#### `registerUser(userData)`
- **Purpose:** Register a new student
- **Parameters:**
  - `name` (string): Student's full name
  - `universityId` (string): Unique university ID
  - `faculty` (string): Student's faculty
  - `major` (string): Student's major
  - `password` (string): Account password
  - `photoUri` (string, optional): Profile picture URI
- **Returns:** `{ success, user, uid }` or `{ success, error }`

#### `loginUser(universityId, password)`
- **Purpose:** Authenticate a student
- **Returns:** `{ success, user, userData }` or `{ success, error }`

### Election Service

#### `getActiveElectionsForUser(userFaculty)`
- **Purpose:** Get elections visible to the user
- **Returns:** `{ success, elections }` or `{ success, error }`

#### `castElectionVote(electionId, candidateId, userFaculty)`
- **Purpose:** Submit a vote in an election
- **Security:** Checks for existing vote, validates time window
- **Returns:** `{ success, message }` or `{ success, error }`

### Poll Service

#### `getActivePollsForUser(userFaculty)`
- **Purpose:** Get polls visible to the user
- **Returns:** `{ success, polls }` or `{ success, error }`

#### `castPollVote(pollId, optionId, userFaculty)`
- **Purpose:** Submit a vote in a poll
- **Returns:** `{ success, message }` or `{ success, error }`

---

## 7. Deployment

### Mobile App Deployment

#### Android
1. Generate signing key
2. Configure `android/app/build.gradle`
3. Build release APK: `cd android && ./gradlew assembleRelease`
4. Test APK on device
5. Upload to Google Play Console

#### iOS
1. Configure signing in Xcode
2. Archive app in Xcode
3. Upload to App Store Connect
4. Submit for review

### Admin Panel Deployment

#### Firebase Hosting
```bash
firebase init hosting
firebase deploy --only hosting
```

#### Alternative: Static Hosting
- Deploy to Netlify, Vercel, or any static hosting
- Ensure CORS is configured for Firebase

### Firebase Configuration

1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy security rules
5. Enable Firebase Storage
6. Configure indexes

---

## 8. Performance Considerations

### Optimization Techniques

1. **Firestore Queries:**
   - Use indexes for compound queries
   - Limit query results
   - Cache frequently accessed data

2. **Images:**
   - Compress images before upload
   - Use Firebase Storage CDN
   - Implement lazy loading

3. **Offline Support:**
   - Firestore offline persistence enabled
   - Cache user profile data
   - Queue votes when offline

4. **Mobile App:**
   - Code splitting
   - Lazy load screens
   - Optimize re-renders with React.memo

---

## 9. Monitoring & Logging

### Firebase Console

- Monitor authentication events
- Track database reads/writes
- Monitor storage usage
- View crash reports

### Error Handling

- All service functions return `{ success, error }` format
- Errors logged to console
- User-friendly error messages displayed

---

## 10. Scalability

### Current Capacity

- **Firestore:** 1 million concurrent connections
- **Storage:** Unlimited
- **Authentication:** Unlimited users

### Scaling Considerations

- Use Firebase Cloud Functions for heavy computations
- Implement result caching for closed elections
- Consider sharding for very large datasets
- Use Firestore subcollections for related data

---

## 11. Backup & Recovery

### Firestore Backups

- Enable automated backups in Firebase Console
- Export data regularly
- Store exports in Cloud Storage

### Disaster Recovery

- Firebase handles infrastructure reliability
- Implement data validation before writes
- Maintain audit logs of critical operations

---

**Document Version:** 1.0.0  
**Last Updated:** November 13, 2025  
**Maintained By:** Development Team

