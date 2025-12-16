import { auth, db, COLLECTIONS } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  doc,
  getDoc,
  collection,
  getDocs
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

// Helper to compute status based on dates
function computeStatus(item) {
  const now = new Date();
  const startDate = item.start_date?.toDate ? item.start_date.toDate() : new Date(item.start_date);
  const endDate = item.end_date?.toDate ? item.end_date.toDate() : new Date(item.end_date);
  
  if (now < startDate) return 'scheduled';
  if (now >= startDate && now <= endDate) return 'active';
  return 'closed';
}

async function loadDashboardStats() {
  try {
    // Load Elections
    const electionsSnapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    const elections = [];
    electionsSnapshot.forEach(doc => {
      elections.push({ id: doc.id, ...doc.data() });
    });
    document.getElementById('totalElections').textContent = elections.length;

    // Load Polls
    const pollsSnapshot = await getDocs(collection(db, COLLECTIONS.POLLS));
    const polls = [];
    pollsSnapshot.forEach(doc => {
      polls.push({ id: doc.id, ...doc.data() });
    });
    document.getElementById('totalPolls').textContent = polls.length;

    // Load Users
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    document.getElementById('totalUsers').textContent = usersSnapshot.size;

    // Load Votes (may fail if no permission - that's ok)
    try {
      const votesSnapshot = await getDocs(collection(db, COLLECTIONS.VOTES));
      document.getElementById('totalVotes').textContent = votesSnapshot.size;
    } catch (e) {
      document.getElementById('totalVotes').textContent = '0';
    }

    // Render Recent Elections
    renderRecentElections(elections);
    
    // Render Recent Polls
    renderRecentPolls(polls);

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    document.getElementById('totalElections').textContent = '0';
    document.getElementById('totalPolls').textContent = '0';
    document.getElementById('totalUsers').textContent = '0';
    document.getElementById('totalVotes').textContent = '0';
  }
}

function renderRecentElections(elections) {
  const container = document.getElementById('recentElectionsList');
  if (!container) return;

  if (elections.length === 0) {
    container.innerHTML = '<p class="no-data">No elections created yet</p>';
    return;
  }

  // Sort by created_at or start_date, most recent first
  elections.sort((a, b) => {
    const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.start_date);
    const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.start_date);
    return dateB - dateA;
  });

  let html = '<div class="recent-items-grid">';
  
  elections.slice(0, 5).forEach(election => {
    const status = computeStatus(election);
    const startDate = election.start_date?.toDate ? election.start_date.toDate() : new Date(election.start_date);
    const endDate = election.end_date?.toDate ? election.end_date.toDate() : new Date(election.end_date);
    
    const statusClass = status === 'active' ? 'status-active' : 
                        status === 'scheduled' ? 'status-scheduled' : 'status-closed';
    const statusIcon = status === 'active' ? '🔴' : 
                       status === 'scheduled' ? '📅' : '✅';
    
    html += `
      <div class="recent-item-card">
        <div class="recent-item-header">
          <h4>${election.title}</h4>
          <span class="status-badge ${statusClass}">${statusIcon} ${status.toUpperCase()}</span>
        </div>
        <div class="recent-item-meta">
          <span>📅 ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
          <span>🎯 ${election.faculty_scope_type || 'All Faculties'}</span>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function renderRecentPolls(polls) {
  const container = document.getElementById('recentPollsList');
  if (!container) return;

  if (polls.length === 0) {
    container.innerHTML = '<p class="no-data">No polls created yet</p>';
    return;
  }

  // Sort by created_at or start_date, most recent first
  polls.sort((a, b) => {
    const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.start_date);
    const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.start_date);
    return dateB - dateA;
  });

  let html = '<div class="recent-items-grid">';
  
  polls.slice(0, 5).forEach(poll => {
    const status = computeStatus(poll);
    const startDate = poll.start_date?.toDate ? poll.start_date.toDate() : new Date(poll.start_date);
    const endDate = poll.end_date?.toDate ? poll.end_date.toDate() : new Date(poll.end_date);
    
    const statusClass = status === 'active' ? 'status-active' : 
                        status === 'scheduled' ? 'status-scheduled' : 'status-closed';
    const statusIcon = status === 'active' ? '🔴' : 
                       status === 'scheduled' ? '📅' : '✅';
    
    html += `
      <div class="recent-item-card">
        <div class="recent-item-header">
          <h4>${poll.title}</h4>
          <span class="status-badge ${statusClass}">${statusIcon} ${status.toUpperCase()}</span>
        </div>
        <div class="recent-item-meta">
          <span>📅 ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
          <span>🎯 ${poll.target_type || 'All Faculties'}</span>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

export function getCurrentUser() {
  return currentUser;
}

