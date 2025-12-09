// Firebase Web SDK v9 (modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js';

// Firebase configuration
// REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyApJ-yf788oQncbo2p3E0V9BMAyLEhY_cY",
  authDomain: "universityevoting2.firebaseapp.com",
  projectId: "universityevoting2",
  storageBucket: "universityevoting2.firebasestorage.app",
  messagingSenderId: "681736971312",
  appId: "1:681736971312:web:51ff23b2ce275e461ff9f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Collection names
export const COLLECTIONS = {
  USERS: 'Users',
  ELECTIONS: 'Elections',
  CANDIDATES: 'Candidates',
  VOTES: 'Votes',
  POLLS: 'Polls',
  POLL_OPTIONS: 'PollOptions',
  POLL_VOTES: 'PollVotes',
};

// Export instances
export { auth, db, storage };

