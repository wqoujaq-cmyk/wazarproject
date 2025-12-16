import { auth, db, COLLECTIONS } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { sendWelcomeEmail, isEmailConfigured } from './email-service.js';

let editingUserId = null;

export async function loadUsers() {
  const container = document.getElementById('usersList');
  container.innerHTML = '<p class="loading">Loading users...</p>';
  
  try {
    // Load all users without ordering (to avoid index issues)
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="loading">No users found</p>';
      return;
    }
    
    // Convert to array
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by name
    users.sort((a, b) => {
      if (a.name && b.name) {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    
    let html = '<table><thead><tr><th>Name</th><th>University ID</th><th>Faculty</th><th>Major</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    users.forEach((user) => {
      html += `
        <tr>
          <td>${user.name || 'N/A'}</td>
          <td>${user.university_id || 'N/A'}</td>
          <td>${user.faculty || 'N/A'}</td>
          <td>${user.major || 'N/A'}</td>
          <td><span class="badge ${user.role === 'admin' ? 'badge-scheduled' : 'badge-active'}">${user.role || 'N/A'}</span></td>
          <td><span class="badge ${user.is_active ? 'badge-active' : 'badge-inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button class="btn btn-secondary" onclick="editUser('${user.id}')">Edit</button>
            <button class="btn btn-warning" onclick="resetUserPassword('${user.id}', '${user.university_id}')">🔑 Reset</button>
            <button class="btn btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = `<p class="error-message">Error loading users: ${error.message}</p>`;
  }
}

// Open modal for creating a new user
function openUserModal() {
  editingUserId = null;
  document.getElementById('userModalTitle').textContent = 'Add User';
  document.getElementById('userForm').reset();
  document.getElementById('editUserId').value = '';
  document.getElementById('userPassword').required = true;
  document.getElementById('passwordHint').textContent = 'Required for new users (min 6 characters)';
  document.getElementById('userUniversityId').disabled = false;
  document.getElementById('userError').textContent = '';
  document.getElementById('userModal').style.display = 'flex';
}

// Close user modal
function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
  document.getElementById('userForm').reset();
  editingUserId = null;
}

// Open modal for editing an existing user
window.editUser = async function(userId) {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    
    if (!userDoc.exists()) {
      alert('User not found');
      return;
    }
    
    const userData = userDoc.data();
    editingUserId = userId;
    
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('editUserId').value = userId;
    document.getElementById('userName').value = userData.name || '';
    document.getElementById('userUniversityId').value = userData.university_id || '';
    document.getElementById('userUniversityId').disabled = true; // Can't change university ID
    document.getElementById('userContactEmail').value = userData.contact_email || '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;
    document.getElementById('passwordHint').textContent = 'Leave blank to keep current password';
    document.getElementById('userFaculty').value = userData.faculty || '';
    document.getElementById('userMajor').value = userData.major || '';
    document.getElementById('userRole').value = userData.role || 'voter';
    document.getElementById('userStatus').value = userData.is_active ? 'true' : 'false';
    document.getElementById('userError').textContent = '';
    
    document.getElementById('userModal').style.display = 'flex';
  } catch (error) {
    console.error('Error loading user:', error);
    alert('Error loading user data');
  }
};

// Delete user
window.deleteUser = async function(userId) {
  if (confirm('Are you sure you want to delete this user? This will only remove the user data, not the authentication account.')) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
      alert('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  }
};

// Reset user password
window.resetUserPassword = async function(userId, universityId) {
  const newPassword = prompt(
    `Reset password for user: ${universityId}\n\nEnter new password (min 6 characters):`,
    ''
  );
  
  if (!newPassword) {
    return;
  }
  
  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  if (!confirm(`Are you sure you want to reset the password for ${universityId}?`)) {
    return;
  }
  
  try {
    // Firebase config (same as main app)
    const firebaseConfig = {
      apiKey: "AIzaSyCw3WEk0MShGTwLEpO7I8Y85Jv97n06fc4",
      authDomain: "wazar-1a851.firebaseapp.com",
      projectId: "wazar-1a851",
      storageBucket: "wazar-1a851.firebasestorage.app",
      messagingSenderId: "1091521735952",
      appId: "1:1091521735952:web:4c04c10f77e9c71e9c1dfe"
    };
    
    // Create a secondary app for password reset
    const secondaryApp = initializeApp(firebaseConfig, 'PasswordResetApp');
    const secondaryAuth = getAuth(secondaryApp);
    
    const email = `${universityId.toLowerCase()}@university.edu`;
    
    try {
      // Try to sign in with a temporary password (this will fail, which is expected)
      // We need to delete and recreate the user to change password from client side
      // Since we can't update password directly, we'll show instructions
      
      alert(
        `⚠️ Password Reset Limitation\n\n` +
        `Due to Firebase security, you cannot directly reset a password from the admin panel.\n\n` +
        `Options:\n` +
        `1. Go to Firebase Console → Authentication → Users\n` +
        `2. Find user: ${email}\n` +
        `3. Click the menu (⋮) and select "Reset password"\n\n` +
        `Or delete and recreate the user with a new password.`
      );
      
    } finally {
      // Clean up secondary app
      await deleteApp(secondaryApp);
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
    alert('Error: ' + error.message);
  }
};

// Handle form submission
async function handleUserFormSubmit(e) {
  e.preventDefault();
  
  const errorDiv = document.getElementById('userError');
  const saveBtn = document.getElementById('saveUserBtn');
  
  const name = document.getElementById('userName').value.trim();
  const universityId = document.getElementById('userUniversityId').value.trim().toUpperCase();
  const contactEmail = document.getElementById('userContactEmail').value.trim().toLowerCase();
  const password = document.getElementById('userPassword').value;
  const faculty = document.getElementById('userFaculty').value;
  const major = document.getElementById('userMajor').value.trim();
  const role = document.getElementById('userRole').value;
  const isActive = document.getElementById('userStatus').value === 'true';
  
  // Validation
  if (!name || !universityId || !contactEmail || !faculty || !major) {
    errorDiv.textContent = 'Please fill in all required fields';
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    errorDiv.textContent = 'Please enter a valid contact email';
    return;
  }
  
  if (!editingUserId && (!password || password.length < 6)) {
    errorDiv.textContent = 'Password must be at least 6 characters for new users';
    return;
  }
  
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  errorDiv.textContent = '';
  
  try {
    if (editingUserId) {
      // Update existing user
      await updateDoc(doc(db, COLLECTIONS.USERS, editingUserId), {
        name: name,
        contact_email: contactEmail,
        faculty: faculty,
        major: major,
        role: role,
        is_active: isActive,
        updated_at: Timestamp.now()
      });
      
      alert('User updated successfully!');
    } else {
      // Create new user using a secondary Firebase app
      // This prevents signing out the current admin
      const email = `${universityId.toLowerCase()}@university.edu`;
      
      // Firebase config (same as main app)
      const firebaseConfig = {
        apiKey: "AIzaSyApJ-yf788oQncbo2p3E0V9BMAyLEhY_cY",
        authDomain: "universityevoting2.firebaseapp.com",
        projectId: "universityevoting2",
        storageBucket: "universityevoting2.firebasestorage.app",
        messagingSenderId: "681736971312",
        appId: "1:681736971312:web:51ff23b2ce275e461ff9f5"
      };
      
      // Create a secondary app for user creation
      const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);
      
      try {
        // Create Firebase Auth user using secondary app
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const uid = userCredential.user.uid;
        
        // Sign out from secondary app immediately
        await signOut(secondaryAuth);
        
        // Create Firestore document using main app (still logged in as admin)
        await setDoc(doc(db, COLLECTIONS.USERS, uid), {
          user_id: uid,
          university_id: universityId,
          contact_email: contactEmail,
          name: name,
          faculty: faculty,
          major: major,
          role: role,
          is_active: isActive,
          photo_url: null,
          created_at: Timestamp.now()
        });
        
        // Send welcome email if configured
        let emailStatus = '';
        if (isEmailConfigured()) {
          try {
            await sendWelcomeEmail({
              name: name,
              email: contactEmail,  // Use real contact email
              university_id: universityId,
              faculty: faculty,
              major: major,
              role: role
            });
            emailStatus = '\nWelcome email sent to ' + contactEmail + '!';
          } catch (emailError) {
            console.warn('Failed to send welcome email:', emailError);
            emailStatus = '\n(Welcome email not sent - check email configuration)';
          }
        } else {
          emailStatus = '\n(Email not configured - no welcome email sent)';
        }
        
        alert('User created successfully!\nLogin email: ' + email + '\nContact email: ' + contactEmail + emailStatus);
      } finally {
        // Clean up secondary app
        await deleteApp(secondaryApp);
      }
    }
    
    closeUserModal();
    loadUsers();
    
  } catch (error) {
    console.error('Error saving user:', error);
    
    let errorMessage = 'Error saving user';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'A user with this University ID already exists';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak (min 6 characters)';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid University ID format';
    } else {
      errorMessage = error.message;
    }
    
    errorDiv.textContent = errorMessage;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save User';
  }
}

// Load password reset requests
window.loadPasswordResetRequests = async function() {
  const container = document.getElementById('passwordResetList');
  if (!container) return;
  
  container.innerHTML = '<p class="loading">Loading requests...</p>';
  
  try {
    // Get all unused reset tokens
    const q = query(
      collection(db, 'PasswordResetTokens'),
      where('used', '==', false)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = `
        <div class="no-reset-requests">
          <span>✅</span>
          No pending password reset requests
        </div>
      `;
      return;
    }
    
    // Convert to array and sort by date
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    
    requests.sort((a, b) => {
      const timeA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
      const timeB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
      return timeB - timeA; // Most recent first
    });
    
    let html = '';
    requests.forEach((request) => {
      const createdAt = request.created_at?.toDate ? request.created_at.toDate() : new Date(request.created_at);
      const timeAgo = getTimeAgo(createdAt);
      
      html += `
        <div class="reset-request-item">
          <div class="reset-request-info">
            <div class="reset-request-user">${request.university_id || 'Unknown'}</div>
            <div class="reset-request-email">${request.contact_email || 'No email'}</div>
            <div class="reset-request-time">🕐 Requested ${timeAgo}</div>
          </div>
          <div class="reset-request-actions">
            <button class="btn btn-primary btn-sm" onclick="handleResetRequest('${request.id}', '${request.university_id}', '${request.contact_email || ''}')">
              ✓ Reset Password
            </button>
            <button class="btn btn-danger btn-sm" onclick="dismissResetRequest('${request.id}')">
              ✕ Dismiss
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading password reset requests:', error);
    container.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
  }
};

// Handle a password reset request
window.handleResetRequest = async function(requestId, universityId, contactEmail) {
  const email = `${universityId.toLowerCase()}@university.edu`;
  
  // Show instructions with the Firebase Console link
  const firebaseConsoleUrl = 'https://console.firebase.google.com/project/wazar-1a851/authentication/users';
  
  alert(
    `📋 Password Reset Instructions\n\n` +
    `User: ${universityId}\n` +
    `Auth Email: ${email}\n` +
    `Contact Email: ${contactEmail}\n\n` +
    `Steps:\n` +
    `1. Go to Firebase Console → Authentication\n` +
    `2. Find user: ${email}\n` +
    `3. Click the menu (⋮) → "Reset password"\n` +
    `4. Firebase will send a reset email\n\n` +
    `OR\n\n` +
    `Set a new password directly:\n` +
    `Click OK to enter a new password for this user.`
  );
  
  const newPassword = prompt(
    `Enter new password for ${universityId}\n(min 6 characters, or Cancel to skip):`,
    ''
  );
  
  if (newPassword && newPassword.length >= 6) {
    // Note: We can't change Firebase Auth password from client side
    // But we can store it temporarily and notify the admin
    alert(
      `⚠️ Important:\n\n` +
      `Firebase Auth passwords cannot be changed from the admin panel.\n\n` +
      `Please go to Firebase Console:\n` +
      `${firebaseConsoleUrl}\n\n` +
      `Find user "${email}" and reset their password manually.\n\n` +
      `After reset, notify the user at:\n` +
      `${contactEmail}`
    );
  }
  
  // Ask if we should mark this request as handled
  if (confirm('Mark this request as handled?')) {
    await updateDoc(doc(db, 'PasswordResetTokens', requestId), {
      used: true,
      handled_at: Timestamp.now(),
      handled_by: 'admin'
    });
    loadPasswordResetRequests();
  }
};

// Dismiss a reset request
window.dismissResetRequest = async function(requestId) {
  if (!confirm('Are you sure you want to dismiss this request?')) {
    return;
  }
  
  try {
    await deleteDoc(doc(db, 'PasswordResetTokens', requestId));
    loadPasswordResetRequests();
  } catch (error) {
    console.error('Error dismissing request:', error);
    alert('Error: ' + error.message);
  }
};

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

// Export functions to window for onclick handlers
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('createUserBtn')?.addEventListener('click', openUserModal);
  document.getElementById('userForm')?.addEventListener('submit', handleUserFormSubmit);
  
  // Load password reset requests when page loads
  loadPasswordResetRequests();
  
  // Close modal when clicking outside
  document.getElementById('userModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'userModal') {
      closeUserModal();
    }
  });
});
