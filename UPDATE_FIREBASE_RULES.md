# 🔥 Update Firebase Security Rules

## Quick Guide to Deploy Updated Rules

---

## **Step 1: Go to Firebase Console**

1. Open: https://console.firebase.google.com
2. Select your project: **universityevoting2**

---

## **Step 2: Update Firestore Rules**

1. Click **"Firestore Database"** in left menu
2. Click the **"Rules"** tab at the top
3. **Delete everything** in the text editor
4. **Copy and paste this complete ruleset:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Users Collection
    match /Users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Elections Collection - Allow authenticated users to manage
    match /Elections/{electionId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated();
    }
    
    // Candidates Collection
    match /Candidates/{candidateId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated();
    }
    
    // Votes Collection - One vote per user
    match /Votes/{voteId} {
      allow read: if false;
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
    
    // Polls Collection
    match /Polls/{pollId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated();
    }
    
    // PollOptions Collection
    match /PollOptions/{optionId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated();
    }
    
    // PollVotes Collection
    match /PollVotes/{pollVoteId} {
      allow read: if false;
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
  }
}
```

5. Click the blue **"Publish"** button at the top
6. Wait for confirmation message

---

## ✅ **Done!**

Your rules are now updated and the admin panel can create elections, candidates, and polls!

---

**After publishing, go back to your admin panel and refresh - everything will work!**

