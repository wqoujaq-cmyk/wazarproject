import { db, COLLECTIONS } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Store unsubscribe functions for real-time listeners
let unsubscribers = [];
let refreshInterval = null;

// ==================== TAB SWITCHING ====================
// Switch tabs - defined early so it can be used by init
function switchResultsTab(tabId) {
  // Update tab buttons
  document.querySelectorAll('.results-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabId) {
      tab.classList.add('active');
    }
  });

  // Update tab content
  document.querySelectorAll('.results-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const tabContent = document.getElementById(`${tabId}-tab`);
  if (tabContent) {
    tabContent.classList.add('active');
  }
}

// Expose to window for onclick handlers in HTML
window.switchResultsTab = switchResultsTab;

// ==================== INITIALIZATION ====================
// Initialize Results Page
export function initResultsPage() {
  console.log('Initializing Results Page...');
  // Make sure we're on the active elections tab by default
  switchResultsTab('active-elections');
  loadAllResults();
  startAutoRefresh();
}

// Start auto-refresh every 30 seconds
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    loadAllResults();
  }, 30000);
}

// Stop auto-refresh
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Cleanup listeners
function cleanupListeners() {
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];
}

// Load all results
async function loadAllResults() {
  console.log('Loading all results...');
  try {
    await Promise.all([
      loadActiveElections(),
      loadClosedElections(),
      loadPollResults(),
      loadResultsStats()
    ]);
    console.log('All results loaded successfully');
  } catch (error) {
    console.error('Error loading results:', error);
  }
}

// ==================== HELPER FUNCTIONS ====================
// Compute actual status based on dates (ignores stored status if dates don't match)
function computeActualStatus(item) {
  const now = new Date();
  const startDate = item.start_date?.toDate ? item.start_date.toDate() : new Date(item.start_date);
  const endDate = item.end_date?.toDate ? item.end_date.toDate() : new Date(item.end_date);
  
  if (now < startDate) {
    return 'scheduled';
  } else if (now >= startDate && now <= endDate) {
    return 'active';
  } else {
    return 'closed';
  }
}

// Format time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return date.toLocaleDateString();
}

// Update timestamp display
function updateTimestamp(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  }
}

// ==================== STATS LOADING ====================
// Load Results Stats
async function loadResultsStats() {
  try {
    // Get active elections count
    const electionsSnapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    let activeCount = 0;
    electionsSnapshot.forEach(doc => {
      if (doc.data().status === 'active') activeCount++;
    });
    const activeEl = document.getElementById('activeElectionsCount');
    if (activeEl) activeEl.textContent = activeCount;

    // Get active polls count
    const pollsSnapshot = await getDocs(collection(db, COLLECTIONS.POLLS));
    let activePollsCount = 0;
    pollsSnapshot.forEach(doc => {
      if (doc.data().status === 'active') activePollsCount++;
    });
    const pollsEl = document.getElementById('activePollsCount');
    if (pollsEl) pollsEl.textContent = activePollsCount;

    // Get total votes
    const votesSnapshot = await getDocs(collection(db, COLLECTIONS.VOTES));
    const votesEl = document.getElementById('totalVotesCast');
    if (votesEl) votesEl.textContent = votesSnapshot.size;

    // Get unique voters
    const uniqueVoters = new Set();
    votesSnapshot.forEach(doc => {
      const vote = doc.data();
      if (vote.user_id) uniqueVoters.add(vote.user_id);
    });
    const participantsEl = document.getElementById('totalParticipants');
    if (participantsEl) participantsEl.textContent = uniqueVoters.size;

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ==================== ACTIVE ELECTIONS ====================
// Load Active Elections with Live Updates
async function loadActiveElections() {
  const container = document.getElementById('activeElectionsList');
  if (!container) {
    console.warn('activeElectionsList container not found');
    return;
  }
  
  container.innerHTML = '<p class="loading">Loading active elections...</p>';

  try {
    // Get all elections and filter for active/scheduled
    const electionsSnapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    
    const activeElections = [];
    electionsSnapshot.forEach(doc => {
      const election = doc.data();
      const actualStatus = computeActualStatus(election);
      if (actualStatus === 'active' || actualStatus === 'scheduled') {
        activeElections.push({ id: doc.id, ...election, actualStatus });
      }
    });

    console.log(`Found ${activeElections.length} active/scheduled elections`);

    if (activeElections.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🗳️</div>
          <h4>No Active Elections</h4>
          <p>There are no elections currently in progress.</p>
        </div>
      `;
      updateTimestamp('activeElectionsUpdateTime');
      return;
    }

    let html = '';

    for (const election of activeElections) {
      const results = await getElectionResults(election.id);
      html += renderElectionCard(election, results, true);
    }

    container.innerHTML = html;
    updateTimestamp('activeElectionsUpdateTime');

  } catch (error) {
    console.error('Error loading active elections:', error);
    container.innerHTML = '<p class="error-message">Error loading active elections</p>';
  }
}

// ==================== CLOSED ELECTIONS ====================
// Load Closed Elections
async function loadClosedElections() {
  const container = document.getElementById('closedElectionsList');
  if (!container) {
    console.warn('closedElectionsList container not found');
    return;
  }
  
  container.innerHTML = '<p class="loading">Loading closed elections...</p>';

  try {
    const electionsSnapshot = await getDocs(collection(db, COLLECTIONS.ELECTIONS));
    
    const closedElections = [];
    electionsSnapshot.forEach(doc => {
      const election = doc.data();
      const actualStatus = computeActualStatus(election);
      if (actualStatus === 'closed') {
        closedElections.push({ id: doc.id, ...election, actualStatus });
      }
    });

    console.log(`Found ${closedElections.length} closed elections`);

    if (closedElections.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">✅</div>
          <h4>No Closed Elections</h4>
          <p>Completed elections will appear here.</p>
        </div>
      `;
      updateTimestamp('closedElectionsUpdateTime');
      return;
    }

    let html = '';

    for (const election of closedElections) {
      const results = await getElectionResults(election.id);
      html += renderElectionCard(election, results, false);
    }

    container.innerHTML = html;
    updateTimestamp('closedElectionsUpdateTime');

  } catch (error) {
    console.error('Error loading closed elections:', error);
    container.innerHTML = '<p class="error-message">Error loading closed elections</p>';
  }
}

// ==================== ELECTION RESULTS ====================
// Get election results (candidates and votes)
async function getElectionResults(electionId) {
  const results = {
    candidates: [],
    totalVotes: 0
  };

  try {
    // Get votes for this election
    const votesSnapshot = await getDocs(collection(db, COLLECTIONS.VOTES));
    
    const voteCounts = {};
    votesSnapshot.forEach(doc => {
      const vote = doc.data();
      if (vote.election_id === electionId) {
        voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
        results.totalVotes++;
      }
    });

    // Get candidates for this election
    const candidatesSnapshot = await getDocs(collection(db, COLLECTIONS.CANDIDATES));
    
    candidatesSnapshot.forEach(doc => {
      const candidate = doc.data();
      if (candidate.election_id === electionId) {
        const votes = voteCounts[doc.id] || 0;
        const percentage = results.totalVotes > 0 ? (votes / results.totalVotes) * 100 : 0;
        results.candidates.push({
          id: doc.id,
          name: candidate.name,
          faculty: candidate.faculty,
          bio: candidate.bio,
          votes,
          percentage
        });
      }
    });

    // Sort by votes descending
    results.candidates.sort((a, b) => b.votes - a.votes);

  } catch (error) {
    console.error('Error getting election results:', error);
  }

  return results;
}

// Render Election Card
function renderElectionCard(election, results, isLive) {
  const startDate = election.start_date?.toDate ? election.start_date.toDate() : new Date(election.start_date);
  const endDate = election.end_date?.toDate ? election.end_date.toDate() : new Date(election.end_date);
  
  // Use computed actual status based on dates
  const status = election.actualStatus || computeActualStatus(election);
  const statusBadge = isLive && status === 'active' 
    ? '<span class="badge badge-active">🔴 LIVE</span>'
    : `<span class="badge badge-${status}">${status}</span>`;

  let candidatesHtml = '';
  
  if (results.candidates.length === 0) {
    candidatesHtml = '<p class="loading" style="text-align: center; padding: 20px;">No candidates registered</p>';
  } else {
    results.candidates.forEach((candidate, index) => {
      const isWinner = index === 0 && results.totalVotes > 0;
      candidatesHtml += `
        <div class="candidate-result-item ${isWinner && !isLive ? 'winner' : ''}">
          <div class="candidate-rank">${index + 1}</div>
          <div class="candidate-info">
            <div class="candidate-name">
              ${candidate.name}
              ${isWinner && !isLive ? '<span class="winner-badge">🏆 Winner</span>' : ''}
            </div>
            <div class="candidate-faculty">${candidate.faculty}</div>
          </div>
          <div class="candidate-votes-section">
            <div class="vote-progress-container">
              <div class="vote-progress-bar" style="width: ${candidate.percentage}%"></div>
            </div>
            <div class="candidate-vote-count">
              <div class="vote-number">${candidate.votes}</div>
              <div class="vote-percentage">${candidate.percentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      `;
    });
  }

  return `
    <div class="election-result-card ${isLive && status === 'active' ? 'live' : ''}">
      <div class="election-card-header">
        <div class="election-card-info">
          <h4>${election.title}</h4>
          <div class="election-card-meta">
            <span>📅 ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
            <span>🎯 ${election.faculty_scope_type || 'All'}</span>
            ${statusBadge}
          </div>
        </div>
        <div class="election-card-stats">
          <div class="election-stat">
            <div class="election-stat-value">${results.totalVotes}</div>
            <div class="election-stat-label">Total Votes</div>
          </div>
          <div class="election-stat">
            <div class="election-stat-value">${results.candidates.length}</div>
            <div class="election-stat-label">Candidates</div>
          </div>
        </div>
      </div>
      <div class="candidates-results-list">
        ${candidatesHtml}
      </div>
    </div>
  `;
}

// ==================== POLL RESULTS ====================
// Load Poll Results
async function loadPollResults() {
  const container = document.getElementById('pollResultsList');
  if (!container) {
    console.warn('pollResultsList container not found');
    return;
  }
  
  container.innerHTML = '<p class="loading">Loading poll results...</p>';

  try {
    const pollsSnapshot = await getDocs(collection(db, COLLECTIONS.POLLS));

    if (pollsSnapshot.empty) {
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">📊</div>
          <h4>No Polls</h4>
          <p>Poll results will appear here.</p>
        </div>
      `;
      updateTimestamp('pollsUpdateTime');
      return;
    }

    let html = '';
    const polls = [];
    pollsSnapshot.forEach(doc => {
      const pollData = doc.data();
      const actualStatus = computeActualStatus(pollData);
      polls.push({ id: doc.id, ...pollData, actualStatus });
    });

    console.log(`Found ${polls.length} polls`);

    for (const poll of polls) {
      const results = await getPollResults(poll.id);
      html += renderPollCard(poll, results);
    }

    container.innerHTML = html || `
      <div class="no-results">
        <div class="no-results-icon">📊</div>
        <h4>No Polls</h4>
        <p>Poll results will appear here.</p>
      </div>
    `;
    updateTimestamp('pollsUpdateTime');

  } catch (error) {
    console.error('Error loading polls:', error);
    container.innerHTML = '<p class="error-message">Error loading poll results</p>';
  }
}

// Get poll results
async function getPollResults(pollId) {
  const results = {
    options: [],
    totalVotes: 0
  };

  try {
    // Get poll options
    const optionsSnapshot = await getDocs(collection(db, COLLECTIONS.POLL_OPTIONS));
    
    const optionData = [];
    optionsSnapshot.forEach(doc => {
      const option = doc.data();
      if (option.poll_id === pollId) {
        optionData.push({ id: doc.id, ...option });
      }
    });

    // Sort by order
    optionData.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Get votes for this poll
    const votesSnapshot = await getDocs(collection(db, COLLECTIONS.POLL_VOTES));
    
    const voteCounts = {};
    votesSnapshot.forEach(doc => {
      const vote = doc.data();
      if (vote.poll_id === pollId) {
        voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
        results.totalVotes++;
      }
    });

    // Build options with vote counts
    optionData.forEach(option => {
      const votes = voteCounts[option.id] || 0;
      const percentage = results.totalVotes > 0 ? (votes / results.totalVotes) * 100 : 0;
      results.options.push({
        id: option.id,
        text: option.text,
        votes,
        percentage
      });
    });

    // Find winner
    if (results.options.length > 0) {
      const maxVotes = Math.max(...results.options.map(o => o.votes));
      if (maxVotes > 0) {
        results.options.forEach(opt => {
          opt.isWinner = opt.votes === maxVotes;
        });
      }
    }

  } catch (error) {
    console.error('Error getting poll results:', error);
  }

  return results;
}

// Render Poll Card
function renderPollCard(poll, results) {
  const startDate = poll.start_date?.toDate ? poll.start_date.toDate() : new Date(poll.start_date);
  const endDate = poll.end_date?.toDate ? poll.end_date.toDate() : new Date(poll.end_date);
  
  // Use computed actual status based on dates
  const status = poll.actualStatus || computeActualStatus(poll);

  let optionsHtml = '';
  
  if (results.options.length === 0) {
    optionsHtml = '<p class="loading" style="text-align: center;">No options available</p>';
  } else {
    results.options.forEach(option => {
      const barWidth = Math.max(option.percentage, option.votes > 0 ? 8 : 0);
      optionsHtml += `
        <div class="poll-option-item ${option.isWinner ? 'winner' : ''}">
          <div class="poll-option-header">
            <span class="poll-option-text">${option.text} ${option.isWinner ? '🏆' : ''}</span>
            <span class="poll-option-votes">${option.votes} votes</span>
          </div>
          <div class="poll-option-bar">
            <div class="poll-option-fill" style="width: ${barWidth}%">
              ${option.percentage > 0 ? `<span>${option.percentage.toFixed(1)}%</span>` : ''}
            </div>
          </div>
        </div>
      `;
    });
  }

  return `
    <div class="poll-result-card">
      <div class="poll-card-header">
        <h4>${poll.title}</h4>
        <div class="poll-card-meta">
          <span>📅 ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
          <span>🎯 ${poll.target_type || 'All'}</span>
          <span class="badge badge-${status}">${status}</span>
          <span>📊 ${results.totalVotes} total votes</span>
        </div>
      </div>
      <div class="poll-options-list">
        ${optionsHtml}
      </div>
    </div>
  `;
}

// ==================== REFRESH ====================
// Refresh all results (exposed to window)
window.refreshAllResults = function() {
  const btn = document.getElementById('refreshResultsBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Refreshing...';
  }

  loadAllResults().then(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔄 Refresh';
    }
  });
};

// ==================== PAGE OBSERVER ====================
// Auto-load results when results page is active
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.id === 'resultsPage') {
      if (mutation.target.classList.contains('active')) {
        initResultsPage();
      } else {
        stopAutoRefresh();
        cleanupListeners();
      }
    }
  });
});

const resultsPage = document.getElementById('resultsPage');
if (resultsPage) {
  observer.observe(resultsPage, { attributes: true, attributeFilter: ['class'] });
}

// Export loadAllResults for manual use
export { loadAllResults };
