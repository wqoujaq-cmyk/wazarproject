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

// Track if we're editing an existing election
let editingElectionId = null;

export async function loadElections() {
  const container = document.getElementById('electionsList');
  container.innerHTML = '<p class="loading">Loading elections...</p>';
  
  try {
    const electionsSnapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    
    if (electionsSnapshot.empty) {
      container.innerHTML = '<p class="loading">No elections found</p>';
      return;
    }
    
    let html = '';
    
    electionsSnapshot.forEach((doc) => {
      const election = doc.data();
      const startDate = election.start_date?.toDate ? election.start_date.toDate() : new Date(election.start_date);
      const endDate = election.end_date?.toDate ? election.end_date.toDate() : new Date(election.end_date);
      
      html += `
        <div class="list-item">
          <div>
            <div class="list-item-title">${election.title}</div>
            <div class="list-item-subtitle">
              ${election.description || 'No description'}<br>
              Start: ${startDate.toLocaleDateString()} - End: ${endDate.toLocaleDateString()}<br>
              Faculty Scope: ${election.faculty_scope_type}
            </div>
          </div>
          <div>
            <span class="badge badge-${getStatusClass(election.status)}">${election.status}</span>
            <div class="list-item-actions">
              <button class="btn btn-secondary" onclick="editElection('${doc.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteElection('${doc.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading elections:', error);
    container.innerHTML = '<p class="error-message">Error loading elections</p>';
  }
}

function getStatusClass(status) {
  switch(status) {
    case 'active': return 'active';
    case 'scheduled': return 'scheduled';
    case 'closed': return 'closed';
    case 'draft': return 'draft';
    default: return 'inactive';
  }
}

// Format date for datetime-local input
function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Edit Election - Load data and open modal
window.editElection = async function(electionId) {
  try {
    // Show loading state
    const modal = document.getElementById('electionModal');
    const modalTitle = document.getElementById('electionModalTitle');
    
    // Fetch election data from Firebase
    const electionDoc = await getDoc(doc(db, COLLECTIONS.ELECTIONS, electionId));
    
    if (!electionDoc.exists()) {
      alert('Election not found');
      return;
    }
    
    const election = electionDoc.data();
    
    // Store the ID we're editing
    editingElectionId = electionId;
    
    // Update modal title
    modalTitle.textContent = 'Edit Election';
    
    // Populate form fields
    document.getElementById('electionTitle').value = election.title || '';
    document.getElementById('electionDescription').value = election.description || '';
    document.getElementById('electionScopeType').value = election.faculty_scope_type || '';
    document.getElementById('electionStatus').value = election.status || 'draft';
    
    // Handle dates
    const startDate = election.start_date?.toDate ? election.start_date.toDate() : new Date(election.start_date);
    const endDate = election.end_date?.toDate ? election.end_date.toDate() : new Date(election.end_date);
    
    document.getElementById('electionStartDate').value = formatDateForInput(startDate);
    document.getElementById('electionEndDate').value = formatDateForInput(endDate);
    
    // Handle faculty scope checkboxes
    const scopeType = election.faculty_scope_type;
    const facultyGroup = document.getElementById('facultyScopeGroup');
    
    if (scopeType === 'SINGLE_FACULTY' || scopeType === 'MULTI_FACULTY') {
      facultyGroup.style.display = 'block';
      
      // Clear all checkboxes first
      const checkboxes = document.querySelectorAll('#facultyCheckboxes input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);
      
      // Check the ones that match
      if (election.faculty_scope && Array.isArray(election.faculty_scope)) {
        election.faculty_scope.forEach(faculty => {
          const checkbox = document.querySelector(`#facultyCheckboxes input[value="${faculty}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
    } else {
      facultyGroup.style.display = 'none';
    }
    
    // Clear any previous errors
    document.getElementById('electionError').textContent = '';
    
    // Open the modal
    modal.classList.add('active');
    
  } catch (error) {
    console.error('Error loading election for edit:', error);
    alert('Error loading election: ' + error.message);
  }
};

window.deleteElection = async function(electionId) {
  if (confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ELECTIONS, electionId));
      alert('Election deleted successfully');
      loadElections();
    } catch (error) {
      console.error('Error deleting election:', error);
      alert('Error deleting election');
    }
  }
};

// Modal functions
window.openElectionModal = function() {
  // Reset for creating new election
  editingElectionId = null;
  document.getElementById('electionModalTitle').textContent = 'Create Election';
  document.getElementById('electionForm').reset();
  document.getElementById('facultyScopeGroup').style.display = 'none';
  document.getElementById('electionError').textContent = '';
  document.getElementById('electionModal').classList.add('active');
};

window.closeElectionModal = function() {
  document.getElementById('electionModal').classList.remove('active');
  document.getElementById('electionForm').reset();
  document.getElementById('facultyScopeGroup').style.display = 'none';
  document.getElementById('electionError').textContent = '';
  editingElectionId = null;
};

window.toggleFacultySelect = function() {
  const scopeType = document.getElementById('electionScopeType').value;
  const facultyGroup = document.getElementById('facultyScopeGroup');
  
  if (scopeType === 'SINGLE_FACULTY' || scopeType === 'MULTI_FACULTY') {
    facultyGroup.style.display = 'block';
  } else {
    facultyGroup.style.display = 'none';
  }
};

// Form submission - handles both Create and Update
document.getElementById('electionForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('electionTitle').value.trim();
  const description = document.getElementById('electionDescription').value.trim();
  const scopeType = document.getElementById('electionScopeType').value;
  const startDate = new Date(document.getElementById('electionStartDate').value);
  const endDate = new Date(document.getElementById('electionEndDate').value);
  const status = document.getElementById('electionStatus').value;
  
  // Validation
  if (!title) {
    document.getElementById('electionError').textContent = 'Please enter a title';
    return;
  }
  
  if (!scopeType) {
    document.getElementById('electionError').textContent = 'Please select a faculty scope type';
    return;
  }
  
  if (endDate <= startDate) {
    document.getElementById('electionError').textContent = 'End date must be after start date';
    return;
  }
  
  // Get selected faculties
  let facultyScope = [];
  if (scopeType !== 'ALL_FACULTIES') {
    const checkboxes = document.querySelectorAll('#facultyCheckboxes input:checked');
    facultyScope = Array.from(checkboxes).map(cb => cb.value);
    
    if (facultyScope.length === 0) {
      document.getElementById('electionError').textContent = 'Please select at least one faculty';
      return;
    }
  }
  
  const electionData = {
    title,
    description,
    faculty_scope_type: scopeType,
    faculty_scope: facultyScope,
    start_date: Timestamp.fromDate(startDate),
    end_date: Timestamp.fromDate(endDate),
    status,
    updated_at: Timestamp.now()
  };
  
  try {
    if (editingElectionId) {
      // UPDATE existing election
      await updateDoc(doc(db, COLLECTIONS.ELECTIONS, editingElectionId), electionData);
      closeElectionModal();
      loadElections();
      alert('Election updated successfully!');
    } else {
      // CREATE new election
      electionData.created_at = Timestamp.now();
      await addDoc(collection(db, COLLECTIONS.ELECTIONS), electionData);
      closeElectionModal();
      loadElections();
      alert('Election created successfully!');
    }
  } catch (error) {
    console.error('Error saving election:', error);
    document.getElementById('electionError').textContent = 'Error saving election: ' + error.message;
  }
});

// Initialize
document.getElementById('createElectionBtn')?.addEventListener('click', openElectionModal);
