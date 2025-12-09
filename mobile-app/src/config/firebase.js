// Firebase Configuration for React Native
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Firebase is automatically initialized by @react-native-firebase
// using google-services.json (Android) and GoogleService-Info.plist (iOS)

// Enable offline persistence for Firestore
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

// Export Firebase instances
export { auth, firestore, storage };

// Firebase configuration object (for reference only)
// The actual config is in google-services.json and GoogleService-Info.plist
export const firebaseConfig = {
  // Replace these values with your Firebase project configuration
  // These are automatically loaded from native config files
  // This object is here for documentation purposes only
  apiKey: "AIzaSyApJ-yf788oQncbo2p3E0V9BMAyLEhY_cY",
  authDomain: "universityevoting2.firebaseapp.com",
  projectId: "universityevoting2",
  storageBucket: "universityevoting2.firebasestorage.app",
  messagingSenderId: "681736971312",
  appId: "1:681736971312:web:51ff23b2ce275e461ff9f5"
};

// Firestore collection names (constants for consistency)
export const COLLECTIONS = {
  USERS: 'Users',
  ELECTIONS: 'Elections',
  CANDIDATES: 'Candidates',
  VOTES: 'Votes',
  POLLS: 'Polls',
  POLL_OPTIONS: 'PollOptions',
  POLL_VOTES: 'PollVotes',
};

// Faculty types (enum)
export const FACULTIES = {
  ENGINEERING: 'Engineering',
  MEDICINE: 'Medicine',
  BUSINESS: 'Business',
  SCIENCE: 'Science',
  ARTS: 'Arts',
  LAW: 'Law',
  EDUCATION: 'Education',
};

// Faculty scope types
export const FACULTY_SCOPE_TYPES = {
  SINGLE_FACULTY: 'SINGLE_FACULTY',
  MULTI_FACULTY: 'MULTI_FACULTY',
  ALL_FACULTIES: 'ALL_FACULTIES',
};

// Election/Poll status
export const STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  CLOSED: 'closed',
};

// User roles
export const ROLES = {
  VOTER: 'voter',
  ADMIN: 'admin',
};

export default {
  auth,
  firestore,
  storage,
  COLLECTIONS,
  FACULTIES,
  FACULTY_SCOPE_TYPES,
  STATUS,
  ROLES,
};

