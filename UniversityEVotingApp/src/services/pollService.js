// Poll Service
import { firestore, COLLECTIONS } from '../config/firebase';
import firebase from '@react-native-firebase/firestore';
import { getCurrentUser } from './authService';
import { canUserVoteInPoll, isActiveNow } from '../utils/helpers';

/**
 * Get all active polls for a user based on their faculty
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

export const getActivePollsForUser = async (userFaculty) => {
  try {
    // Fetch all non-draft polls (active, scheduled, and closed for results)
    const pollsSnapshot = await firestore()
      .collection(COLLECTIONS.POLLS)
      .where('status', 'in', ['active', 'scheduled', 'closed'])
      .get();
    
    const polls = [];
    pollsSnapshot.forEach(doc => {
      const poll = { id: doc.id, ...doc.data() };
      
      // Check if user can vote in this poll
      if (canUserVoteInPoll(userFaculty, poll)) {
        // Compute actual status based on dates (not stored status)
        const computed_status = computeActualStatus(poll);
        polls.push({ ...poll, computed_status });
      }
    });
    
    // Sort by status then start date
    polls.sort((a, b) => {
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
      polls,
    };
  } catch (error) {
    console.error('Get active polls error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get poll by ID
 */
export const getPollById = async (pollId) => {
  try {
    const pollDoc = await firestore()
      .collection(COLLECTIONS.POLLS)
      .doc(pollId)
      .get();
    
    if (!pollDoc.exists) {
      return { success: false, error: 'Poll not found' };
    }
    
    return {
      success: true,
      poll: { id: pollDoc.id, ...pollDoc.data() },
    };
  } catch (error) {
    console.error('Get poll error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get options for a poll
 */
export const getPollOptions = async (pollId) => {
  try {
    // Query without orderBy to avoid requiring a composite index
    const optionsSnapshot = await firestore()
      .collection(COLLECTIONS.POLL_OPTIONS)
      .where('poll_id', '==', pollId)
      .get();
    
    const options = [];
    optionsSnapshot.forEach(doc => {
      options.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by order field client-side (more robust, no index needed)
    options.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return {
      success: true,
      options,
    };
  } catch (error) {
    console.error('Get poll options error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Cast vote in a poll
 */
export const castPollVote = async (pollId, optionId, userFaculty) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    // Check if user has already voted
    const existingVote = await firestore()
      .collection(COLLECTIONS.POLL_VOTES)
      .where('poll_id', '==', pollId)
      .where('user_id', '==', currentUser.uid)
      .limit(1)
      .get();
    
    if (!existingVote.empty) {
      return {
        success: false,
        error: 'You have already voted in this poll',
      };
    }
    
    // Verify poll is still active
    const pollResult = await getPollById(pollId);
    if (!pollResult.success) {
      return pollResult;
    }
    
    const poll = pollResult.poll;
    if (!isActiveNow(poll.start_date, poll.end_date)) {
      return {
        success: false,
        error: 'Poll is not currently active',
      };
    }
    
    // Create vote document
    await firestore()
      .collection(COLLECTIONS.POLL_VOTES)
      .add({
        poll_id: pollId,
        user_id: currentUser.uid,
        option_id: optionId,
        faculty: userFaculty,
        timestamp: firebase.FieldValue.serverTimestamp(),
      });
    
    return {
      success: true,
      message: 'Vote cast successfully',
    };
  } catch (error) {
    console.error('Cast poll vote error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if user has voted in a poll
 */
export const hasVotedInPoll = async (pollId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    const voteSnapshot = await firestore()
      .collection(COLLECTIONS.POLL_VOTES)
      .where('poll_id', '==', pollId)
      .where('user_id', '==', currentUser.uid)
      .limit(1)
      .get();
    
    return {
      success: true,
      hasVoted: !voteSnapshot.empty,
    };
  } catch (error) {
    console.error('Check poll vote status error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get poll results (only for closed polls)
 */
export const getPollResults = async (pollId) => {
  try {
    // Get poll details
    const pollResult = await getPollById(pollId);
    if (!pollResult.success) {
      return pollResult;
    }
    
    const poll = pollResult.poll;
    
    // Check if poll is closed
    const now = new Date();
    const endDate = poll.end_date.toDate ? poll.end_date.toDate() : new Date(poll.end_date);
    
    if (now < endDate && poll.status !== 'closed') {
      return {
        success: false,
        error: 'Results not available yet. Poll is still active.',
      };
    }
    
    // Get all votes for this poll
    const votesSnapshot = await firestore()
      .collection(COLLECTIONS.POLL_VOTES)
      .where('poll_id', '==', pollId)
      .get();
    
    // Count votes per option
    const voteCounts = {};
    let totalVotes = 0;
    
    votesSnapshot.forEach(doc => {
      const vote = doc.data();
      if (!voteCounts[vote.option_id]) {
        voteCounts[vote.option_id] = 0;
      }
      voteCounts[vote.option_id]++;
      totalVotes++;
    });
    
    // Get poll options
    const optionsResult = await getPollOptions(pollId);
    if (!optionsResult.success) {
      return optionsResult;
    }
    
    // Combine option info with vote counts
    const results = optionsResult.options.map(option => ({
      ...option,
      votes: voteCounts[option.id] || 0,
      percentage: totalVotes > 0 ? ((voteCounts[option.id] || 0) / totalVotes * 100).toFixed(2) : 0,
    }));
    
    // Sort by votes (descending)
    results.sort((a, b) => b.votes - a.votes);
    
    return {
      success: true,
      results,
      totalVotes,
      poll,
    };
  } catch (error) {
    console.error('Get poll results error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Listen to polls for a user
 */
export const listenToPolls = (userFaculty, callback) => {
  return firestore()
    .collection(COLLECTIONS.POLLS)
    .where('status', 'in', ['active', 'scheduled'])
    .onSnapshot(
      (snapshot) => {
        const polls = [];
        snapshot.forEach(doc => {
          const poll = { id: doc.id, ...doc.data() };
          if (canUserVoteInPoll(userFaculty, poll)) {
            polls.push(poll);
          }
        });
        callback({ success: true, polls });
      },
      (error) => {
        console.error('Listen to polls error:', error);
        callback({ success: false, error: error.message });
      }
    );
};

export default {
  getActivePollsForUser,
  getPollById,
  getPollOptions,
  castPollVote,
  hasVotedInPoll,
  getPollResults,
  listenToPolls,
};

