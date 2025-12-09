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

// Export functions to window for onclick handlers
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('createUserBtn')?.addEventListener('click', openUserModal);
  document.getElementById('userForm')?.addEventListener('submit', handleUserFormSubmit);
  
  // Close modal when clicking outside
  document.getElementById('userModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'userModal') {
      closeUserModal();
    }
  });
});
