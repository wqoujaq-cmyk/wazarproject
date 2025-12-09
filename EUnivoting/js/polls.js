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

async function loadPolls() {
  const container = document.getElementById('pollsList');
  container.innerHTML = '<p class="loading">Loading polls...</p>';
  
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.POLLS));
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="loading">No polls found</p>';
      return;
    }
    
    let html = '';
    
    snapshot.forEach((doc) => {
      const poll = doc.data();
      const startDate = poll.start_date?.toDate ? poll.start_date.toDate() : new Date(poll.start_date);
      const endDate = poll.end_date?.toDate ? poll.end_date.toDate() : new Date(poll.end_date);
      
      html += `
        <div class="list-item">
          <div>
            <div class="list-item-title">${poll.title}</div>
            <div class="list-item-subtitle">
              ${poll.description || 'No description'}<br>
              Start: ${startDate.toLocaleDateString()} - End: ${endDate.toLocaleDateString()}<br>
              Target: ${poll.target_type}
            </div>
          </div>
          <div>
            <span class="badge badge-${getStatusClass(poll.status)}">${poll.status}</span>
            <div class="list-item-actions">
              <button class="btn btn-secondary" onclick="editPoll('${doc.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deletePoll('${doc.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading polls:', error);
    container.innerHTML = '<p class="error-message">Error loading polls</p>';
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
window.editPoll = async function(pollId) {
  alert(`Edit poll feature would open a modal for poll: ${pollId}`);
  // Implement edit modal here
};

window.deletePoll = async function(pollId) {
  if (confirm('Are you sure you want to delete this poll?')) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.POLLS, pollId));
      alert('Poll deleted successfully');
      loadPolls();
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Error deleting poll');
    }
  }
};

// Modal functions
window.openPollModal = function() {
  document.getElementById('pollModal').classList.add('active');
};

window.closePollModal = function() {
  document.getElementById('pollModal').classList.remove('active');
  document.getElementById('pollForm').reset();
  document.getElementById('pollFacultyScopeGroup').style.display = 'none';
  // Reset poll options to initial state
  document.getElementById('pollOptionsContainer').innerHTML = `
    <input type="text" class="poll-option" placeholder="Option 1" required>
    <input type="text" class="poll-option" placeholder="Option 2" required>
  `;
};

window.togglePollFacultySelect = function() {
  const targetType = document.getElementById('pollTargetType').value;
  const facultyGroup = document.getElementById('pollFacultyScopeGroup');
  
  if (targetType === 'SINGLE_FACULTY' || targetType === 'MULTI_FACULTY') {
    facultyGroup.style.display = 'block';
  } else {
    facultyGroup.style.display = 'none';
  }
};

window.addPollOption = function() {
  const container = document.getElementById('pollOptionsContainer');
  const optionCount = container.querySelectorAll('.poll-option').length + 1;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'poll-option';
  input.placeholder = `Option ${optionCount}`;
  input.required = true;
  container.appendChild(input);
};

// Form submission
document.getElementById('pollForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('pollTitle').value;
  const description = document.getElementById('pollDescription').value;
  const targetType = document.getElementById('pollTargetType').value;
  const startDate = new Date(document.getElementById('pollStartDate').value);
  const endDate = new Date(document.getElementById('pollEndDate').value);
  const status = document.getElementById('pollStatus').value;
  
  // Get selected faculties
  let targetFaculties = [];
  if (targetType !== 'ALL_FACULTIES') {
    const checkboxes = document.querySelectorAll('#pollFacultyCheckboxes input:checked');
    targetFaculties = Array.from(checkboxes).map(cb => cb.value);
    
    if (targetFaculties.length === 0) {
      document.getElementById('pollError').textContent = 'Please select at least one faculty';
      return;
    }
  }
  
  // Get poll options
  const optionInputs = document.querySelectorAll('.poll-option');
  const options = Array.from(optionInputs).map(input => input.value.trim()).filter(val => val);
  
  if (options.length < 2) {
    document.getElementById('pollError').textContent = 'Please provide at least 2 options';
    return;
  }
  
  try {
    // Create poll
    const pollRef = await addDoc(collection(db, COLLECTIONS.POLLS), {
      title,
      description,
      target_type: targetType,
      target_faculties: targetFaculties,
      start_date: Timestamp.fromDate(startDate),
      end_date: Timestamp.fromDate(endDate),
      status,
      created_at: Timestamp.now()
    });
    
    // Create poll options
    for (let i = 0; i < options.length; i++) {
      await addDoc(collection(db, COLLECTIONS.POLL_OPTIONS), {
        poll_id: pollRef.id,
        text: options[i],
        order: i
      });
    }
    
    closePollModal();
    loadPolls();
    alert('Poll created successfully!');
  } catch (error) {
    console.error('Error creating poll:', error);
    document.getElementById('pollError').textContent = 'Error creating poll: ' + error.message;
  }
});

// Initialize
document.getElementById('createPollBtn')?.addEventListener('click', openPollModal);

