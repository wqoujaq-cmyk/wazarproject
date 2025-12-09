import { db, COLLECTIONS } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

export async function loadUsers() {
  const container = document.getElementById('usersList');
  container.innerHTML = '<p class="loading">Loading users...</p>';
  
  try {
    const usersQuery = query(collection(db, COLLECTIONS.USERS), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="loading">No users found</p>';
      return;
    }
    
    let html = '<table><thead><tr><th>Name</th><th>University ID</th><th>Faculty</th><th>Major</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    snapshot.forEach((doc) => {
      const user = doc.data();
      html += `
        <tr>
          <td>${user.name}</td>
          <td>${user.university_id}</td>
          <td>${user.faculty}</td>
          <td>${user.major}</td>
          <td><span class="badge ${user.role === 'admin' ? 'badge-scheduled' : 'badge-active'}">${user.role}</span></td>
          <td><span class="badge ${user.is_active ? 'badge-active' : 'badge-inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button class="btn btn-secondary" onclick="editUser('${doc.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteUser('${doc.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = '<p class="error-message">Error loading users</p>';
  }
}

// Export to window for onclick handlers
window.editUser = async function(userId) {
  alert(`Edit user feature would open a modal for user: ${userId}`);
  // Implement edit modal here
};

window.deleteUser = async function(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
      alert('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  }
};

// Initialize
document.getElementById('createUserBtn')?.addEventListener('click', () => {
  alert('Create user feature would open a modal');
  // Implement create modal here
});

