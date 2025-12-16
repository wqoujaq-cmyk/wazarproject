// Election Service
import { firestore, COLLECTIONS, STATUS } from '../config/firebase';
import { getCurrentUser } from './authService';
import { canUserVoteInElection, isActiveNow } from '../utils/helpers';

/**
 * Get all active elections for a user based on their faculty
 */
// Helper function to compute actual status based on dates
const computeActualStatus = (item) => {
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
};

export const getActiveElectionsForUser = async (userFaculty) => {
  try {
    // Fetch all non-draft elections (active, scheduled, and closed for results)
    const electionsSnapshot = await firestore()
      .collection(COLLECTIONS.ELECTIONS)
      .where('status', 'in', ['active', 'scheduled', 'closed'])
      .get();
    
    const elections = [];
    electionsSnapshot.forEach(doc => {
      const election = { id: doc.id, ...doc.data() };
      
      // Check if user can vote in this election
      if (canUserVoteInElection(userFaculty, election)) {
        // Compute actual status based on dates (not stored status)
        const computed_status = computeActualStatus(election);
        elections.push({ ...election, computed_status });
      }
    });
    
    // Sort by start date (most recent first for active, oldest first for scheduled)
    elections.sort((a, b) => {
      // Active first, then scheduled, then closed
      const statusOrder = { active: 0, scheduled: 1, closed: 2 };
      if (statusOrder[a.computed_status] !== statusOrder[b.computed_status]) {
        return statusOrder[a.computed_status] - statusOrder[b.computed_status];
      }
      const dateA = a.start_date.toDate ? a.start_date.toDate() : new Date(a.start_date);
      const dateB = b.start_date.toDate ? b.start_date.toDate() : new Date(b.start_date);
      return dateA - dateB;
    });
    
    return {
      success: true,
      elections,
    };
  } catch (error) {
    console.error('Get active elections error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get election by ID
 */
export const getElectionById = async (electionId) => {
  try {
    const electionDoc = await firestore()
      .collection(COLLECTIONS.ELECTIONS)
      .doc(electionId)
      .get();
    
    if (!electionDoc.exists) {
      return { success: false, error: 'Election not found' };
    }
    
    return {
      success: true,
      election: { id: electionDoc.id, ...electionDoc.data() },
    };
  } catch (error) {
    console.error('Get election error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get candidates for an election
 */
export const getCandidatesForElection = async (electionId, userFaculty = null) => {
  try {
    let query = firestore()
      .collection(COLLECTIONS.CANDIDATES)
      .where('election_id', '==', electionId);
    
    // Optionally filter by faculty
    if (userFaculty) {
      query = query.where('faculty', '==', userFaculty);
    }
    
    const candidatesSnapshot = await query.get();
    
    const candidates = [];
    candidatesSnapshot.forEach(doc => {
      candidates.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      candidates,
    };
  } catch (error) {
    console.error('Get candidates error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get candidate by ID
 */
export const getCandidateById = async (candidateId) => {
  try {
    const candidateDoc = await firestore()
      .collection(COLLECTIONS.CANDIDATES)
      .doc(candidateId)
      .get();
    
    if (!candidateDoc.exists) {
      return { success: false, error: 'Candidate not found' };
    }
    
    return {
      success: true,
      candidate: { id: candidateDoc.id, ...candidateDoc.data() },
    };
  } catch (error) {
    console.error('Get candidate error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Cast vote in an election
 */
export const castElectionVote = async (electionId, candidateId, userFaculty) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    // Check if user has already voted
    const existingVote = await firestore()
      .collection(COLLECTIONS.VOTES)
      .where('election_id', '==', electionId)
      .where('user_id', '==', currentUser.uid)
      .limit(1)
      .get();
    
    if (!existingVote.empty) {
      return {
        success: false,
        error: 'You have already voted in this election',
      };
    }
    
    // Verify election is still active
    const electionResult = await getElectionById(electionId);
    if (!electionResult.success) {
      return electionResult;
    }
    
    const election = electionResult.election;
    if (!isActiveNow(election.start_date, election.end_date)) {
      return {
        success: false,
        error: 'Election is not currently active',
      };
    }
    
    // Create vote document
    await firestore()
      .collection(COLLECTIONS.VOTES)
      .add({
        election_id: electionId,
        user_id: currentUser.uid,
        candidate_id: candidateId,
        faculty: userFaculty,
        timestamp: new Date(),
      });
    
    return {
      success: true,
      message: 'Vote cast successfully',
    };
  } catch (error) {
    console.error('Cast vote error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if user has voted in an election
 */
export const hasVotedInElection = async (electionId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    const voteSnapshot = await firestore()
      .collection(COLLECTIONS.VOTES)
      .where('election_id', '==', electionId)
      .where('user_id', '==', currentUser.uid)
      .limit(1)
      .get();
    
    return {
      success: true,
      hasVoted: !voteSnapshot.empty,
    };
  } catch (error) {
    console.error('Check vote status error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get election results (only for closed elections)
 */
export const getElectionResults = async (electionId) => {
  try {
    // Get election details
    const electionResult = await getElectionById(electionId);
    if (!electionResult.success) {
      return electionResult;
    }
    
    const election = electionResult.election;
    
    // Check if election is closed
    const now = new Date();
    const endDate = election.end_date.toDate ? election.end_date.toDate() : new Date(election.end_date);
    
    if (now < endDate && election.status !== 'closed') {
      return {
        success: false,
        error: 'Results not available yet. Election is still active.',
      };
    }
    
    // Get all votes for this election
    const votesSnapshot = await firestore()
      .collection(COLLECTIONS.VOTES)
      .where('election_id', '==', electionId)
      .get();
    
    // Count votes per candidate
    const voteCounts = {};
    let totalVotes = 0;
    
    votesSnapshot.forEach(doc => {
      const vote = doc.data();
      if (!voteCounts[vote.candidate_id]) {
        voteCounts[vote.candidate_id] = 0;
      }
      voteCounts[vote.candidate_id]++;
      totalVotes++;
    });
    
    // Get candidate details
    const candidatesResult = await getCandidatesForElection(electionId);
    if (!candidatesResult.success) {
      return candidatesResult;
    }
    
    // Combine candidate info with vote counts
    const results = candidatesResult.candidates.map(candidate => ({
      ...candidate,
      votes: voteCounts[candidate.id] || 0,
      percentage: totalVotes > 0 ? ((voteCounts[candidate.id] || 0) / totalVotes * 100).toFixed(2) : 0,
    }));
    
    // Sort by votes (descending)
    results.sort((a, b) => b.votes - a.votes);
    
    return {
      success: true,
      results,
      totalVotes,
      election,
    };
  } catch (error) {
    console.error('Get election results error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Listen to elections for a user
 */
export const listenToElections = (userFaculty, callback) => {
  return firestore()
    .collection(COLLECTIONS.ELECTIONS)
    .where('status', 'in', ['active', 'scheduled'])
    .onSnapshot(
      (snapshot) => {
        const elections = [];
        snapshot.forEach(doc => {
          const election = { id: doc.id, ...doc.data() };
          if (canUserVoteInElection(userFaculty, election)) {
            elections.push(election);
          }
        });
        callback({ success: true, elections });
      },
      (error) => {
        console.error('Listen to elections error:', error);
        callback({ success: false, error: error.message });
      }
    );
};

export default {
  getActiveElectionsForUser,
  getElectionById,
  getCandidatesForElection,
  getCandidateById,
  castElectionVote,
  hasVotedInElection,
  getElectionResults,
  listenToElections,
};

