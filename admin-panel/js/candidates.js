import { db, COLLECTIONS } from './firebase-config.js';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Track if we're editing an existing candidate
let editingCandidateId = null;

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

// Load elections for the dropdown
async function loadElectionsDropdown() {
  try {
    const electionsSnapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    const select = document.getElementById('candidateElection');
    select.innerHTML = '<option value="">Select election...</option>';
    
    electionsSnapshot.forEach(docSnap => {
      const election = docSnap.data();
      const option = document.createElement('option');
      option.value = docSnap.id;
      option.textContent = election.title;
      select.appendChild(option);
    });
    
    return true;
  } catch (error) {
    console.error('Error loading elections:', error);
    return false;
  }
}

// Edit Candidate - Load data and open modal
window.editCandidate = async function(candidateId) {
  try {
    // Fetch candidate data from Firebase
    const candidateDoc = await getDoc(doc(db, COLLECTIONS.CANDIDATES, candidateId));
    
    if (!candidateDoc.exists()) {
      alert('Candidate not found');
      return;
    }
    
    const candidate = candidateDoc.data();
    
    // Store the ID we're editing
    editingCandidateId = candidateId;
    
    // Update modal title
    const modalHeader = document.querySelector('#candidateModal .modal-header h2');
    if (modalHeader) {
      modalHeader.textContent = 'Edit Candidate';
    }
    
    // Load elections dropdown first
    await loadElectionsDropdown();
    
    // Populate form fields
    document.getElementById('candidateName').value = candidate.name || '';
    document.getElementById('candidateElection').value = candidate.election_id || '';
    document.getElementById('candidateFaculty').value = candidate.faculty || '';
    document.getElementById('candidateBio').value = candidate.bio || '';
    
    // Clear any previous errors
    document.getElementById('candidateError').textContent = '';
    
    // Open the modal
    document.getElementById('candidateModal').classList.add('active');
    
  } catch (error) {
    console.error('Error loading candidate for edit:', error);
    alert('Error loading candidate: ' + error.message);
  }
};

window.deleteCandidate = async function(candidateId) {
  if (confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
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
  // Reset for creating new candidate
  editingCandidateId = null;
  
  // Update modal title
  const modalHeader = document.querySelector('#candidateModal .modal-header h2');
  if (modalHeader) {
    modalHeader.textContent = 'Add Candidate';
  }
  
  // Reset form
  document.getElementById('candidateForm').reset();
  document.getElementById('candidateError').textContent = '';
  
  // Load elections for dropdown
  await loadElectionsDropdown();
  
  document.getElementById('candidateModal').classList.add('active');
};

window.closeCandidateModal = function() {
  document.getElementById('candidateModal').classList.remove('active');
  document.getElementById('candidateForm').reset();
  document.getElementById('candidateError').textContent = '';
  editingCandidateId = null;
};

// Form submission - handles both Create and Update
document.getElementById('candidateForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('candidateName').value.trim();
  const electionId = document.getElementById('candidateElection').value;
  const faculty = document.getElementById('candidateFaculty').value;
  const bio = document.getElementById('candidateBio').value.trim();
  
  // Validation
  if (!name) {
    document.getElementById('candidateError').textContent = 'Please enter a name';
    return;
  }
  
  if (!electionId) {
    document.getElementById('candidateError').textContent = 'Please select an election';
    return;
  }
  
  if (!faculty) {
    document.getElementById('candidateError').textContent = 'Please select a faculty';
    return;
  }
  
  const candidateData = {
    name,
    election_id: electionId,
    faculty,
    bio,
    updated_at: Timestamp.now()
  };
  
  try {
    if (editingCandidateId) {
      // UPDATE existing candidate
      await updateDoc(doc(db, COLLECTIONS.CANDIDATES, editingCandidateId), candidateData);
      closeCandidateModal();
      loadCandidates();
      alert('Candidate updated successfully!');
    } else {
      // CREATE new candidate
      candidateData.photo_url = null;
      candidateData.created_at = Timestamp.now();
      await addDoc(collection(db, COLLECTIONS.CANDIDATES), candidateData);
      closeCandidateModal();
      loadCandidates();
      alert('Candidate added successfully!');
    }
  } catch (error) {
    console.error('Error saving candidate:', error);
    document.getElementById('candidateError').textContent = 'Error saving candidate: ' + error.message;
  }
});

// Initialize
document.getElementById('createCandidateBtn')?.addEventListener('click', openCandidateModal);
