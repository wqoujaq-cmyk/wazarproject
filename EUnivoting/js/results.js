import { db, COLLECTIONS } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

async function loadResults() {
  const container = document.getElementById('electionResultsList');
  container.innerHTML = '<p class="loading">Loading results...</p>';
  
  try {
    // Get all closed elections
    const electionsQuery = query(collection(db, COLLECTIONS.ELECTIONS), where('status', '==', 'closed'));
    const electionsSnapshot = await getDocs(electionsQuery);
    
    if (electionsSnapshot.empty) {
      container.innerHTML = '<p class="loading">No closed elections found</p>';
      return;
    }
    
    let html = '';
    
    for (const electionDoc of electionsSnapshot.docs) {
      const election = electionDoc.data();
      
      // Get votes for this election
      const votesQuery = query(collection(db, COLLECTIONS.VOTES), where('election_id', '==', electionDoc.id));
      const votesSnapshot = await getDocs(votesQuery);
      
      // Count votes per candidate
      const voteCounts = {};
      votesSnapshot.forEach(voteDoc => {
        const vote = voteDoc.data();
        if (!voteCounts[vote.candidate_id]) {
          voteCounts[vote.candidate_id] = 0;
        }
        voteCounts[vote.candidate_id]++;
      });
      
      const totalVotes = votesSnapshot.size;
      
      html += `
        <div class="section">
          <h4>${election.title}</h4>
          <p>Total Votes: ${totalVotes}</p>
          <div class="list-container">
      `;
      
      // Get candidates for this election
      const candidatesQuery = query(collection(db, COLLECTIONS.CANDIDATES), where('election_id', '==', electionDoc.id));
      const candidatesSnapshot = await getDocs(candidatesQuery);
      
      const results = [];
      candidatesSnapshot.forEach(candidateDoc => {
        const candidate = candidateDoc.data();
        const votes = voteCounts[candidateDoc.id] || 0;
        const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;
        results.push({ candidate, votes, percentage });
      });
      
      // Sort by votes descending
      results.sort((a, b) => b.votes - a.votes);
      
      results.forEach((result, index) => {
        html += `
          <div class="list-item">
            <div>
              <div class="list-item-title">#${index + 1} ${result.candidate.name}</div>
              <div class="list-item-subtitle">${result.candidate.faculty}</div>
            </div>
            <div>
              <strong>${result.votes} votes (${result.percentage}%)</strong>
            </div>
          </div>
        `;
      });
      
      html += '</div></div>';
    }
    
    container.innerHTML = html || '<p class="loading">No results available</p>';
    
  } catch (error) {
    console.error('Error loading results:', error);
    container.innerHTML = '<p class="error-message">Error loading results</p>';
  }
}

// Auto-load results when results page is active
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.id === 'resultsPage' && mutation.target.classList.contains('active')) {
      loadResults();
    }
  });
});

const resultsPage = document.getElementById('resultsPage');
if (resultsPage) {
  observer.observe(resultsPage, { attributes: true, attributeFilter: ['class'] });
}

