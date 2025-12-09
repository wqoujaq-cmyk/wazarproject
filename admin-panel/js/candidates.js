import { db, COLLECTIONS } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

export async function loadCandidates() {
  const container = document.getElementById('candidatesList');
  container.innerHTML = '<p class="loading">Loading candidates...</p>';
  
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CANDIDATES));
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="loading">No candidates found</p>';
      return;
    }
    
    let html = '<table><thead><tr><th>Name</th><th>Faculty</th><th>Election ID</th><th>Bio</th><th>Actions</th></tr></thead><tbody>';
    
    snapshot.forEach((doc) => {
      const candidate = doc.data();
      const bioPreview = candidate.bio ? candidate.bio.substring(0, 50) + '...' : 'N/A';
      
      html += `
        <tr>
          <td>${candidate.name}</td>
          <td>${candidate.faculty}</td>
          <td>${candidate.election_id}</td>
          <td>${bioPreview}</td>
          <td>
            <button class="btn btn-secondary" onclick="editCandidate('${doc.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteCandidate('${doc.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading candidates:', error);
    container.innerHTML = '<p class="error-message">Error loading candidates</p>';
  }
}

// Export to window for onclick handlers
window.editCandidate = async function(candidateId) {
  alert(`Edit candidate feature would open a modal for candidate: ${candidateId}`);
  // Implement edit modal here
};

window.deleteCandidate = async function(candidateId) {
  if (confirm('Are you sure you want to delete this candidate?')) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CANDIDATES, candidateId));
      alert('Candidate deleted successfully');
      loadCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('Error deleting candidate');
    }
  }
};

// Modal functions
window.openCandidateModal = async function() {
  // Load elections for dropdown
  try {
    const electionsSnapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    const select = document.getElementById('candidateElection');
    select.innerHTML = '<option value="">Select election...</option>';
    
    electionsSnapshot.forEach(doc => {
      const election = doc.data();
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = election.title;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading elections:', error);
  }
  
  document.getElementById('candidateModal').classList.add('active');
};

window.closeCandidateModal = function() {
  document.getElementById('candidateModal').classList.remove('active');
  document.getElementById('candidateForm').reset();
};

// Form submission
document.getElementById('candidateForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('candidateName').value;
  const electionId = document.getElementById('candidateElection').value;
  const faculty = document.getElementById('candidateFaculty').value;
  const bio = document.getElementById('candidateBio').value;
  
  try {
    await addDoc(collection(db, COLLECTIONS.CANDIDATES), {
      name,
      election_id: electionId,
      faculty,
      bio,
      photo_url: null,
      created_at: Timestamp.now()
    });
    
    closeCandidateModal();
    loadCandidates();
    alert('Candidate added successfully!');
  } catch (error) {
    console.error('Error creating candidate:', error);
    document.getElementById('candidateError').textContent = 'Error adding candidate: ' + error.message;
  }
});

// Initialize
document.getElementById('createCandidateBtn')?.addEventListener('click', openCandidateModal);

