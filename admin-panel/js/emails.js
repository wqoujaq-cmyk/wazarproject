import { auth, db, COLLECTIONS } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import {
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  sendWelcomeEmail,
  sendAnnouncementEmail,
  sendNotificationEmail,
  sendResultsEmail,
  isEmailConfigured,
  initEmailJS,
  getEmailConfig
} from './email-service.js';

// Check and display email configuration status
export async function checkEmailConfig() {
  const statusDiv = document.getElementById('emailConfigStatus');
  if (!statusDiv) return;
  
  const configured = isEmailConfigured();
  
  if (configured) {
    statusDiv.innerHTML = `
      <div class="config-ok">
        <span class="status-icon">✅</span>
        <span>Email service is configured and ready</span>
      </div>
    `;
    statusDiv.className = 'config-status config-ok';
  } else {
    statusDiv.innerHTML = `
      <div class="config-warning">
        <span class="status-icon">⚠️</span>
        <span>Email service not configured. Click "Configure" to set up EmailJS.</span>
      </div>
    `;
    statusDiv.className = 'config-status config-warning';
  }
}

// Get all users
async function getAllUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  const users = [];
  snapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
}

// Get users by filter
async function getUsersByFilter(filter, facultyValue = null) {
  let users = await getAllUsers();
  
  switch (filter) {
    case 'voters':
      return users.filter(u => u.role === 'voter');
    case 'admins':
      return users.filter(u => u.role === 'admin');
    case 'faculty':
      return users.filter(u => u.faculty === facultyValue);
    case 'all':
    default:
      return users;
  }
}

// ==================== ANNOUNCEMENT ====================

window.openAnnouncementModal = function() {
  document.getElementById('announcementForm').reset();
  document.getElementById('announcementError').textContent = '';
  document.getElementById('announcementSuccess').style.display = 'none';
  document.getElementById('announcementFacultyGroup').style.display = 'none';
  document.getElementById('announcementModal').style.display = 'flex';
  
  // Toggle faculty select based on target
  document.getElementById('announcementTarget').addEventListener('change', function() {
    document.getElementById('announcementFacultyGroup').style.display = 
      this.value === 'faculty' ? 'block' : 'none';
  });
};

window.closeAnnouncementModal = function() {
  document.getElementById('announcementModal').style.display = 'none';
};

async function handleAnnouncementSubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('sendAnnouncementBtn');
  const errorDiv = document.getElementById('announcementError');
  const successDiv = document.getElementById('announcementSuccess');
  
  const subject = document.getElementById('announcementSubject').value.trim();
  const message = document.getElementById('announcementMessage').value.trim();
  const target = document.getElementById('announcementTarget').value;
  const faculty = document.getElementById('announcementFaculty').value;
  
  if (!subject || !message) {
    errorDiv.textContent = 'Please fill in all required fields';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Sending...';
  errorDiv.textContent = '';
  successDiv.style.display = 'none';
  
  try {
    const recipients = await getUsersByFilter(target, faculty);
    
    if (recipients.length === 0) {
      errorDiv.textContent = 'No recipients found for the selected filter';
      return;
    }
    
    const result = await sendAnnouncementEmail(recipients, {
      subject,
      message,
      fromName: 'University E-Voting Admin'
    });
    
    if (result.success) {
      const sent = result.results.filter(r => r.success).length;
      successDiv.textContent = `Announcement sent to ${sent}/${recipients.length} recipients`;
      successDiv.style.display = 'block';
      document.getElementById('announcementForm').reset();
    } else {
      errorDiv.textContent = result.error || 'Failed to send announcement';
    }
  } catch (error) {
    console.error('Error sending announcement:', error);
    errorDiv.textContent = error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Announcement';
  }
}

// ==================== PASSWORD RESET ====================

window.openPasswordResetModal = function() {
  document.getElementById('passwordResetForm').reset();
  document.getElementById('resetError').textContent = '';
  document.getElementById('resetSuccess').style.display = 'none';
  document.getElementById('passwordResetModal').style.display = 'flex';
};

window.closePasswordResetModal = function() {
  document.getElementById('passwordResetModal').style.display = 'none';
};

async function handlePasswordResetSubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('sendResetBtn');
  const errorDiv = document.getElementById('resetError');
  const successDiv = document.getElementById('resetSuccess');
  
  const universityId = document.getElementById('resetUniversityId').value.trim().toUpperCase();
  
  if (!universityId) {
    errorDiv.textContent = 'Please enter a University ID';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Sending...';
  errorDiv.textContent = '';
  successDiv.style.display = 'none';
  
  try {
    // Find user by university_id to get their contact_email
    const usersQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('university_id', '==', universityId)
    );
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) {
      errorDiv.textContent = 'No user found with this University ID';
      return;
    }
    
    const userData = snapshot.docs[0].data();
    const contactEmail = userData.contact_email;
    
    if (!contactEmail) {
      errorDiv.textContent = 'No contact email found for this user';
      return;
    }
    
    // Send password reset email via EmailJS to contact_email
    const config = JSON.parse(localStorage.getItem('emailjs_settings') || '{}');
    
    await initEmailJS();
    
    await window.emailjs.send(
      config.serviceId || 'service_ly8htul',
      config.templateReset || 'template_cr3mrly',
      {
        to_name: userData.name,
        to_email: contactEmail,
        university_id: universityId,
        user_name: userData.name
      }
    );
    
    successDiv.textContent = `Password reset email sent to ${contactEmail}`;
    successDiv.style.display = 'block';
    document.getElementById('passwordResetForm').reset();
  } catch (error) {
    console.error('Error sending password reset:', error);
    errorDiv.textContent = error.message || 'Failed to send password reset email';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Reset Email';
  }
}

// ==================== ELECTION NOTIFICATION ====================

window.openElectionNotifyModal = async function() {
  document.getElementById('electionNotifyForm').reset();
  document.getElementById('electionNotifyError').textContent = '';
  document.getElementById('electionNotifySuccess').style.display = 'none';
  document.getElementById('electionNotifyModal').style.display = 'flex';
  
  // Load elections
  const select = document.getElementById('notifyElectionSelect');
  select.innerHTML = '<option value="">Loading...</option>';
  
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    select.innerHTML = '<option value="">Select an election...</option>';
    
    snapshot.forEach((doc) => {
      const election = doc.data();
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = `${election.title} (${election.status})`;
      option.dataset.title = election.title;
      option.dataset.description = election.description || '';
      option.dataset.startDate = election.start_date?.toDate?.()?.toLocaleDateString() || '';
      option.dataset.endDate = election.end_date?.toDate?.()?.toLocaleDateString() || '';
      option.dataset.faculties = JSON.stringify(election.faculty_scope || []);
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading elections:', error);
    select.innerHTML = '<option value="">Error loading elections</option>';
  }
};

window.closeElectionNotifyModal = function() {
  document.getElementById('electionNotifyModal').style.display = 'none';
};

async function handleElectionNotifySubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('sendElectionNotifyBtn');
  const errorDiv = document.getElementById('electionNotifyError');
  const successDiv = document.getElementById('electionNotifySuccess');
  
  const select = document.getElementById('notifyElectionSelect');
  const electionId = select.value;
  const selectedOption = select.options[select.selectedIndex];
  const customMessage = document.getElementById('electionNotifyMessage').value.trim();
  
  if (!electionId) {
    errorDiv.textContent = 'Please select an election';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Sending...';
  errorDiv.textContent = '';
  successDiv.style.display = 'none';
  
  try {
    // Get eligible voters based on faculty scope
    let recipients = await getAllUsers();
    recipients = recipients.filter(u => u.role === 'voter' && u.is_active);
    
    const faculties = JSON.parse(selectedOption.dataset.faculties || '[]');
    if (faculties.length > 0) {
      recipients = recipients.filter(u => faculties.includes(u.faculty));
    }
    
    if (recipients.length === 0) {
      errorDiv.textContent = 'No eligible voters found';
      return;
    }
    
    const result = await sendNotificationEmail(recipients, {
      type: 'election',
      title: selectedOption.dataset.title,
      description: customMessage || selectedOption.dataset.description,
      startDate: selectedOption.dataset.startDate,
      endDate: selectedOption.dataset.endDate
    });
    
    if (result.success) {
      const sent = result.results.filter(r => r.success).length;
      successDiv.textContent = `Notification sent to ${sent}/${recipients.length} voters`;
      successDiv.style.display = 'block';
    } else {
      errorDiv.textContent = result.error || 'Failed to send notifications';
    }
  } catch (error) {
    console.error('Error sending election notifications:', error);
    errorDiv.textContent = error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Notifications';
  }
}

// ==================== POLL NOTIFICATION ====================

window.openPollNotifyModal = async function() {
  document.getElementById('pollNotifyForm').reset();
  document.getElementById('pollNotifyError').textContent = '';
  document.getElementById('pollNotifySuccess').style.display = 'none';
  document.getElementById('pollNotifyModal').style.display = 'flex';
  
  // Load polls
  const select = document.getElementById('notifyPollSelect');
  select.innerHTML = '<option value="">Loading...</option>';
  
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.POLLS));
    select.innerHTML = '<option value="">Select a poll...</option>';
    
    snapshot.forEach((doc) => {
      const poll = doc.data();
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = `${poll.title} (${poll.status})`;
      option.dataset.title = poll.title;
      option.dataset.description = poll.description || '';
      option.dataset.startDate = poll.start_date?.toDate?.()?.toLocaleDateString() || '';
      option.dataset.endDate = poll.end_date?.toDate?.()?.toLocaleDateString() || '';
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading polls:', error);
    select.innerHTML = '<option value="">Error loading polls</option>';
  }
};

window.closePollNotifyModal = function() {
  document.getElementById('pollNotifyModal').style.display = 'none';
};

async function handlePollNotifySubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('sendPollNotifyBtn');
  const errorDiv = document.getElementById('pollNotifyError');
  const successDiv = document.getElementById('pollNotifySuccess');
  
  const select = document.getElementById('notifyPollSelect');
  const pollId = select.value;
  const selectedOption = select.options[select.selectedIndex];
  const customMessage = document.getElementById('pollNotifyMessage').value.trim();
  
  if (!pollId) {
    errorDiv.textContent = 'Please select a poll';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Sending...';
  errorDiv.textContent = '';
  successDiv.style.display = 'none';
  
  try {
    let recipients = await getAllUsers();
    recipients = recipients.filter(u => u.is_active);
    
    if (recipients.length === 0) {
      errorDiv.textContent = 'No active users found';
      return;
    }
    
    const result = await sendNotificationEmail(recipients, {
      type: 'poll',
      title: selectedOption.dataset.title,
      description: customMessage || selectedOption.dataset.description,
      startDate: selectedOption.dataset.startDate,
      endDate: selectedOption.dataset.endDate
    });
    
    if (result.success) {
      const sent = result.results.filter(r => r.success).length;
      successDiv.textContent = `Notification sent to ${sent}/${recipients.length} users`;
      successDiv.style.display = 'block';
    } else {
      errorDiv.textContent = result.error || 'Failed to send notifications';
    }
  } catch (error) {
    console.error('Error sending poll notifications:', error);
    errorDiv.textContent = error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Notifications';
  }
}

// ==================== RESULTS NOTIFICATION ====================

window.openResultsNotifyModal = function() {
  document.getElementById('resultsNotifyForm').reset();
  document.getElementById('resultsNotifyError').textContent = '';
  document.getElementById('resultsNotifySuccess').style.display = 'none';
  document.getElementById('resultsSelect').innerHTML = '<option value="">Select type first...</option>';
  document.getElementById('resultsNotifyModal').style.display = 'flex';
};

window.closeResultsNotifyModal = function() {
  document.getElementById('resultsNotifyModal').style.display = 'none';
};

window.loadResultsOptions = async function() {
  const type = document.getElementById('resultsType').value;
  const select = document.getElementById('resultsSelect');
  
  if (!type) {
    select.innerHTML = '<option value="">Select type first...</option>';
    return;
  }
  
  select.innerHTML = '<option value="">Loading...</option>';
  
  try {
    const collectionName = type === 'election' ? COLLECTIONS.ELECTIONS : COLLECTIONS.POLLS;
    const snapshot = await getDocs(collection(db, collectionName));
    
    select.innerHTML = `<option value="">Select ${type}...</option>`;
    
    snapshot.forEach((doc) => {
      const item = doc.data();
      if (item.status === 'closed') {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = item.title;
        option.dataset.title = item.title;
        select.appendChild(option);
      }
    });
    
    if (select.options.length === 1) {
      select.innerHTML = `<option value="">No closed ${type}s found</option>`;
    }
  } catch (error) {
    console.error('Error loading results options:', error);
    select.innerHTML = '<option value="">Error loading</option>';
  }
};

async function handleResultsNotifySubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('sendResultsNotifyBtn');
  const errorDiv = document.getElementById('resultsNotifyError');
  const successDiv = document.getElementById('resultsNotifySuccess');
  
  const type = document.getElementById('resultsType').value;
  const select = document.getElementById('resultsSelect');
  const itemId = select.value;
  const customMessage = document.getElementById('resultsNotifyMessage').value.trim();
  
  if (!type || !itemId) {
    errorDiv.textContent = 'Please select type and item';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Sending...';
  errorDiv.textContent = '';
  successDiv.style.display = 'none';
  
  try {
    const selectedOption = select.options[select.selectedIndex];
    let recipients = await getAllUsers();
    recipients = recipients.filter(u => u.is_active);
    
    const result = await sendResultsEmail(recipients, {
      title: selectedOption.dataset.title,
      winnerName: 'See results in app', // Would need to calculate actual results
      winnerVotes: '-',
      totalVotes: '-',
      customMessage
    });
    
    if (result.success) {
      const sent = result.results.filter(r => r.success).length;
      successDiv.textContent = `Results announcement sent to ${sent}/${recipients.length} users`;
      successDiv.style.display = 'block';
    } else {
      errorDiv.textContent = result.error || 'Failed to send results';
    }
  } catch (error) {
    console.error('Error sending results:', error);
    errorDiv.textContent = error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Announce Results';
  }
}

// ==================== EMAIL SETTINGS ====================

window.openEmailSettingsModal = function() {
  document.getElementById('emailSettingsForm').reset();
  document.getElementById('settingsError').textContent = '';
  document.getElementById('settingsSuccess').style.display = 'none';
  
  // Load saved settings from localStorage
  const settings = JSON.parse(localStorage.getItem('emailjs_settings') || '{}');
  document.getElementById('emailPublicKey').value = settings.publicKey || 'EPO61S4tPNKPKy6UH';
  document.getElementById('emailServiceId').value = settings.serviceId || 'service_ly8htul';
  document.getElementById('templateWelcome').value = settings.templateWelcome || 'template_sghhqdn';
  document.getElementById('templateNotify').value = settings.templateNotify || 'template_exu823x';
  document.getElementById('templateAnnounce').value = settings.templateAnnounce || 'template_xs2bkbh';
  document.getElementById('templateResults').value = settings.templateResults || 'template_tz1xidg';
  document.getElementById('templateReset').value = settings.templateReset || 'template_cr3mrly';
  
  document.getElementById('emailSettingsModal').style.display = 'flex';
};

window.closeEmailSettingsModal = function() {
  document.getElementById('emailSettingsModal').style.display = 'none';
};

function handleEmailSettingsSubmit(e) {
  e.preventDefault();
  
  const errorDiv = document.getElementById('settingsError');
  const successDiv = document.getElementById('settingsSuccess');
  
  const settings = {
    publicKey: document.getElementById('emailPublicKey').value.trim(),
    serviceId: document.getElementById('emailServiceId').value.trim(),
    templateWelcome: document.getElementById('templateWelcome').value.trim(),
    templateNotify: document.getElementById('templateNotify').value.trim(),
    templateAnnounce: document.getElementById('templateAnnounce').value.trim(),
    templateResults: document.getElementById('templateResults').value.trim(),
    templateReset: document.getElementById('templateReset').value.trim()
  };
  
  if (!settings.publicKey || !settings.serviceId) {
    errorDiv.textContent = 'Public Key and Service ID are required';
    return;
  }
  
  // Save to localStorage
  localStorage.setItem('emailjs_settings', JSON.stringify(settings));
  
  successDiv.textContent = '✅ Settings saved! Email system is now active and ready to use.';
  successDiv.style.display = 'block';
  errorDiv.textContent = '';
  
  // Refresh config status
  checkEmailConfig();
}

// ==================== INITIALIZATION ====================

export function initEmails() {
  // Check email config on load
  checkEmailConfig();
  
  // Form handlers
  document.getElementById('announcementForm')?.addEventListener('submit', handleAnnouncementSubmit);
  document.getElementById('passwordResetForm')?.addEventListener('submit', handlePasswordResetSubmit);
  document.getElementById('electionNotifyForm')?.addEventListener('submit', handleElectionNotifySubmit);
  document.getElementById('pollNotifyForm')?.addEventListener('submit', handlePollNotifySubmit);
  document.getElementById('resultsNotifyForm')?.addEventListener('submit', handleResultsNotifySubmit);
  document.getElementById('emailSettingsForm')?.addEventListener('submit', handleEmailSettingsSubmit);
  
  // Close modals on outside click
  ['announcementModal', 'passwordResetModal', 'electionNotifyModal', 'pollNotifyModal', 'resultsNotifyModal', 'emailSettingsModal'].forEach(modalId => {
    document.getElementById(modalId)?.addEventListener('click', (e) => {
      if (e.target.id === modalId) {
        document.getElementById(modalId).style.display = 'none';
      }
    });
  });
}

// Export send welcome email for use in users.js
export { sendWelcomeEmail };

