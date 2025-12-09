import { auth, db, COLLECTIONS } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

let currentUser = null;

export function initAuth() {
  // Listen to auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if user is admin
          if (userData.role === 'admin') {
            currentUser = userData;
            showDashboard();
          } else {
            await signOut(auth);
            showError('Access denied. Admin privileges required.');
            showLogin();
          }
        } else {
          await signOut(auth);
          showError('User data not found');
          showLogin();
        }
      } catch (error) {
        console.error('Error checking user:', error);
        showError('Error loading user data');
        showLogin();
      }
    } else {
      // User is signed out
      currentUser = null;
      showLogin();
    }
  });

  // Login form handler
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Logout button handler
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const errorDiv = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  const btnText = document.getElementById('loginBtnText');
  const btnSpinner = document.getElementById('loginBtnSpinner');
  
  // Show loading
  btn.disabled = true;
  btnText.style.display = 'none';
  btnSpinner.style.display = 'block';
  errorDiv.textContent = '';
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle the rest
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
    }
    
    errorDiv.textContent = errorMessage;
  } finally {
    btn.disabled = false;
    btnText.style.display = 'block';
    btnSpinner.style.display = 'none';
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error logging out');
  }
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('dashboardScreen').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'block';
  
  // Display admin name
  if (currentUser) {
    document.getElementById('adminName').textContent = currentUser.name || 'Admin';
    loadDashboardStats();
  }
}

function showError(message) {
  document.getElementById('loginError').textContent = message;
}

async function loadDashboardStats() {
  // This will be implemented to load dashboard statistics
  // For now, just placeholder
  document.getElementById('totalElections').textContent = '-';
  document.getElementById('totalPolls').textContent = '-';
  document.getElementById('totalUsers').textContent = '-';
  document.getElementById('totalVotes').textContent = '-';
}

export function getCurrentUser() {
  return currentUser;
}

