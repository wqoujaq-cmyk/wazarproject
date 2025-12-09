// Authentication Service
import { auth, firestore, storage, COLLECTIONS, ROLES } from '../config/firebase';

// EmailJS Configuration for welcome emails
const EMAILJS_CONFIG = {
  serviceId: 'service_ly8htul',
  templateId: 'template_sghhqdn',
  publicKey: 'EPO61S4tPNKPKy6UH',
};

/**
 * Send welcome email via EmailJS API
 */
const sendWelcomeEmail = async (userData) => {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          to_name: userData.name,
          to_email: userData.contactEmail,
          university_id: userData.universityId,
          faculty: userData.faculty,
          major: userData.major,
          role: 'voter',
        },
      }),
    });
    
    if (response.ok) {
      console.log('Welcome email sent successfully');
      return true;
    } else {
      console.warn('Failed to send welcome email:', await response.text());
      return false;
    }
  } catch (error) {
    console.warn('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    const { name, universityId, contactEmail, faculty, major, password, photoUri } = userData;
    
    // Create email from university ID (e.g., ENG001@university.edu)
    // Remove spaces and special characters for valid email
    const cleanId = universityId.toLowerCase().replace(/\s+/g, '').trim();
    const email = `${cleanId}@university.edu`;
    
    // Create Firebase Auth user
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    
    // Upload profile picture if provided
    let photoUrl = null;
    if (photoUri) {
      photoUrl = await uploadProfilePicture(uid, photoUri);
    }
    
    // Create user document in Firestore
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .set({
        user_id: uid,
        university_id: universityId,
        contact_email: contactEmail,
        name: name,
        faculty: faculty,
        major: major,
        photo_url: photoUrl,
        role: ROLES.VOTER,
        is_active: true,
        created_at: firestore.FieldValue.serverTimestamp(),
      });
    
    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      name,
      contactEmail,
      universityId,
      faculty,
      major,
    });
    
    return {
      success: true,
      user: userCredential.user,
      uid,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Login user
 */
export const loginUser = async (universityId, password) => {
  try {
    // Create email from university ID (remove spaces for valid email)
    const cleanId = universityId.toLowerCase().replace(/\s+/g, '').trim();
    const email = `${cleanId}@university.edu`;
    
    // Sign in with Firebase Auth
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
    // Get user document from Firestore
    const userDoc = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userCredential.user.uid)
      .get();
    
    if (!userDoc.exists) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    
    // Check if user is active
    if (!userData.is_active) {
      await auth().signOut();
      throw new Error('Account is inactive. Please contact administrator.');
    }
    
    return {
      success: true,
      user: userCredential.user,
      userData,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Get current user data from Firestore
 */
export const getCurrentUserData = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    const userDoc = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(currentUser.uid)
      .get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User data not found' };
    }
    
    return {
      success: true,
      userData: userDoc.data(),
    };
  } catch (error) {
    console.error('Get user data error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload profile picture to Firebase Storage
 */
export const uploadProfilePicture = async (uid, photoUri) => {
  try {
    const reference = storage().ref(`profilePictures/${uid}`);
    await reference.putFile(photoUri);
    const url = await reference.getDownloadURL();
    return url;
  } catch (error) {
    console.error('Upload profile picture error:', error);
    throw error;
  }
};

/**
 * Update user profile picture
 */
export const updateProfilePicture = async (photoUri) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    const photoUrl = await uploadProfilePicture(currentUser.uid, photoUri);
    
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(currentUser.uid)
      .update({
        photo_url: photoUrl,
      });
    
    return {
      success: true,
      photoUrl,
    };
  } catch (error) {
    console.error('Update profile picture error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Reset password (send reset email)
 */
export const resetPassword = async (universityId) => {
  try {
    const email = `${universityId.toLowerCase()}@university.edu`;
    await auth().sendPasswordResetEmail(email);
    return {
      success: true,
      message: 'Password reset email sent',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = () => {
  return auth().currentUser !== null;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

/**
 * Get user-friendly error messages
 */
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This university ID is already registered';
    case 'auth/invalid-email':
      return 'Invalid email format';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this university ID';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your university ID and password';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection';
    default:
      return 'An error occurred. Please try again';
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getCurrentUserData,
  uploadProfilePicture,
  updateProfilePicture,
  resetPassword,
  isUserLoggedIn,
  onAuthStateChanged,
};

