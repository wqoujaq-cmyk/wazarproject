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
    default: return 'inactive';
  }
}

// Export to window for onclick handlers
window.editElection = async function(electionId) {
  alert(`Edit election feature would open a modal for election: ${electionId}`);
  // Implement edit modal here
};

window.deleteElection = async function(electionId) {
  if (confirm('Are you sure you want to delete this election?')) {
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
  document.getElementById('electionModal').classList.add('active');
};

window.closeElectionModal = function() {
  document.getElementById('electionModal').classList.remove('active');
  document.getElementById('electionForm').reset();
  document.getElementById('facultyScopeGroup').style.display = 'none';
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

// Form submission
document.getElementById('electionForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('electionTitle').value;
  const description = document.getElementById('electionDescription').value;
  const scopeType = document.getElementById('electionScopeType').value;
  const startDate = new Date(document.getElementById('electionStartDate').value);
  const endDate = new Date(document.getElementById('electionEndDate').value);
  const status = document.getElementById('electionStatus').value;
  
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
  
  try {
    await addDoc(collection(db, COLLECTIONS.ELECTIONS), {
      title,
      description,
      faculty_scope_type: scopeType,
      faculty_scope: facultyScope,
      start_date: Timestamp.fromDate(startDate),
      end_date: Timestamp.fromDate(endDate),
      status,
      created_at: Timestamp.now()
    });
    
    closeElectionModal();
    loadElections();
    alert('Election created successfully!');
  } catch (error) {
    console.error('Error creating election:', error);
    document.getElementById('electionError').textContent = 'Error creating election: ' + error.message;
  }
});

// Initialize
document.getElementById('createElectionBtn')?.addEventListener('click', openElectionModal);

