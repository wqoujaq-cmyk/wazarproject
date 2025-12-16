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
  where,
  orderBy,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Track if we're editing an existing poll
let editingPollId = null;

export async function loadPolls() {
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

// Edit Poll - Load data and open modal
window.editPoll = async function(pollId) {
  try {
    // Fetch poll data from Firebase
    const pollDoc = await getDoc(doc(db, COLLECTIONS.POLLS, pollId));
    
    if (!pollDoc.exists()) {
      alert('Poll not found');
      return;
    }
    
    const poll = pollDoc.data();
    
    // Store the ID we're editing
    editingPollId = pollId;
    
    // Update modal title
    const modalHeader = document.querySelector('#pollModal .modal-header h2');
    if (modalHeader) {
      modalHeader.textContent = 'Edit Poll';
    }
    
    // Populate form fields
    document.getElementById('pollTitle').value = poll.title || '';
    document.getElementById('pollDescription').value = poll.description || '';
    document.getElementById('pollTargetType').value = poll.target_type || '';
    document.getElementById('pollStatus').value = poll.status || 'draft';
    
    // Handle dates
    const startDate = poll.start_date?.toDate ? poll.start_date.toDate() : new Date(poll.start_date);
    const endDate = poll.end_date?.toDate ? poll.end_date.toDate() : new Date(poll.end_date);
    
    document.getElementById('pollStartDate').value = formatDateForInput(startDate);
    document.getElementById('pollEndDate').value = formatDateForInput(endDate);
    
    // Handle target faculties checkboxes
    const targetType = poll.target_type;
    const facultyGroup = document.getElementById('pollFacultyScopeGroup');
    
    if (targetType === 'SINGLE_FACULTY' || targetType === 'MULTI_FACULTY') {
      facultyGroup.style.display = 'block';
      
      // Clear all checkboxes first
      const checkboxes = document.querySelectorAll('#pollFacultyCheckboxes input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);
      
      // Check the ones that match
      if (poll.target_faculties && Array.isArray(poll.target_faculties)) {
        poll.target_faculties.forEach(faculty => {
          const checkbox = document.querySelector(`#pollFacultyCheckboxes input[value="${faculty}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
    } else {
      facultyGroup.style.display = 'none';
    }
    
    // Load poll options
    const optionsContainer = document.getElementById('pollOptionsContainer');
    optionsContainer.innerHTML = '';
    
    try {
      const optionsSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.POLL_OPTIONS), where('poll_id', '==', pollId))
      );
      
      if (!optionsSnapshot.empty) {
        // Sort options by order
        const options = [];
        optionsSnapshot.forEach(doc => {
          options.push({ id: doc.id, ...doc.data() });
        });
        options.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Create input fields for each option
        options.forEach((option, index) => {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'poll-option';
          input.placeholder = `Option ${index + 1}`;
          input.required = true;
          input.value = option.text || '';
          input.dataset.optionId = option.id;
          optionsContainer.appendChild(input);
        });
      } else {
        // Default 2 empty options
        optionsContainer.innerHTML = `
          <input type="text" class="poll-option" placeholder="Option 1" required>
          <input type="text" class="poll-option" placeholder="Option 2" required>
        `;
      }
    } catch (optError) {
      console.error('Error loading poll options:', optError);
      optionsContainer.innerHTML = `
        <input type="text" class="poll-option" placeholder="Option 1" required>
        <input type="text" class="poll-option" placeholder="Option 2" required>
      `;
    }
    
    // Clear any previous errors
    document.getElementById('pollError').textContent = '';
    
    // Open the modal
    document.getElementById('pollModal').classList.add('active');
    
  } catch (error) {
    console.error('Error loading poll for edit:', error);
    alert('Error loading poll: ' + error.message);
  }
};

window.deletePoll = async function(pollId) {
  if (confirm('Are you sure you want to delete this poll? This will also delete all poll options and votes.')) {
    try {
      // Delete poll options first
      const optionsSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.POLL_OPTIONS), where('poll_id', '==', pollId))
      );
      
      const deletePromises = [];
      optionsSnapshot.forEach(optDoc => {
        deletePromises.push(deleteDoc(doc(db, COLLECTIONS.POLL_OPTIONS, optDoc.id)));
      });
      
      await Promise.all(deletePromises);
      
      // Delete the poll
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
  // Reset for creating new poll
  editingPollId = null;
  
  // Update modal title
  const modalHeader = document.querySelector('#pollModal .modal-header h2');
  if (modalHeader) {
    modalHeader.textContent = 'Create Poll';
  }
  
  // Reset form
  document.getElementById('pollForm').reset();
  document.getElementById('pollFacultyScopeGroup').style.display = 'none';
  document.getElementById('pollError').textContent = '';
  
  // Reset poll options to initial state
  document.getElementById('pollOptionsContainer').innerHTML = `
    <input type="text" class="poll-option" placeholder="Option 1" required>
    <input type="text" class="poll-option" placeholder="Option 2" required>
  `;
  
  document.getElementById('pollModal').classList.add('active');
};

window.closePollModal = function() {
  document.getElementById('pollModal').classList.remove('active');
  document.getElementById('pollForm').reset();
  document.getElementById('pollFacultyScopeGroup').style.display = 'none';
  document.getElementById('pollError').textContent = '';
  editingPollId = null;
  
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

// Form submission - handles both Create and Update
document.getElementById('pollForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('pollTitle').value.trim();
  const description = document.getElementById('pollDescription').value.trim();
  const targetType = document.getElementById('pollTargetType').value;
  const startDate = new Date(document.getElementById('pollStartDate').value);
  const endDate = new Date(document.getElementById('pollEndDate').value);
  const status = document.getElementById('pollStatus').value;
  
  // Validation
  if (!title) {
    document.getElementById('pollError').textContent = 'Please enter a poll question';
    return;
  }
  
  if (!targetType) {
    document.getElementById('pollError').textContent = 'Please select a target type';
    return;
  }
  
  if (endDate <= startDate) {
    document.getElementById('pollError').textContent = 'End date must be after start date';
    return;
  }
  
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
  const options = Array.from(optionInputs).map(input => ({
    text: input.value.trim(),
    id: input.dataset.optionId || null
  })).filter(opt => opt.text);
  
  if (options.length < 2) {
    document.getElementById('pollError').textContent = 'Please provide at least 2 options';
    return;
  }
  
  const pollData = {
    title,
    description,
    target_type: targetType,
    target_faculties: targetFaculties,
    start_date: Timestamp.fromDate(startDate),
    end_date: Timestamp.fromDate(endDate),
    status,
    updated_at: Timestamp.now()
  };
  
  try {
    if (editingPollId) {
      // UPDATE existing poll
      await updateDoc(doc(db, COLLECTIONS.POLLS, editingPollId), pollData);
      
      // Delete existing options and recreate them
      const existingOptions = await getDocs(
        query(collection(db, COLLECTIONS.POLL_OPTIONS), where('poll_id', '==', editingPollId))
      );
      
      const deletePromises = [];
      existingOptions.forEach(optDoc => {
        deletePromises.push(deleteDoc(doc(db, COLLECTIONS.POLL_OPTIONS, optDoc.id)));
      });
      await Promise.all(deletePromises);
      
      // Create new options
      for (let i = 0; i < options.length; i++) {
        await addDoc(collection(db, COLLECTIONS.POLL_OPTIONS), {
          poll_id: editingPollId,
          text: options[i].text,
          order: i
        });
      }
      
      closePollModal();
      loadPolls();
      alert('Poll updated successfully!');
    } else {
      // CREATE new poll
      pollData.created_at = Timestamp.now();
      const pollRef = await addDoc(collection(db, COLLECTIONS.POLLS), pollData);
      
      // Create poll options
      for (let i = 0; i < options.length; i++) {
        await addDoc(collection(db, COLLECTIONS.POLL_OPTIONS), {
          poll_id: pollRef.id,
          text: options[i].text,
          order: i
        });
      }
      
      closePollModal();
      loadPolls();
      alert('Poll created successfully!');
    }
  } catch (error) {
    console.error('Error saving poll:', error);
    document.getElementById('pollError').textContent = 'Error saving poll: ' + error.message;
  }
});

// Initialize
document.getElementById('createPollBtn')?.addEventListener('click', openPollModal);
