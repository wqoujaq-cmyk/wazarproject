// User Service
import { firestore, COLLECTIONS } from '../config/firebase';
import { getCurrentUser } from './authService';

/**
 * Get user profile by UID
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    
    return {
      success: true,
      userData: userDoc.data(),
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    return await getUserProfile(currentUser.uid);
  } catch (error) {
    console.error('Get current user profile error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    // Only allow updating certain fields
    const allowedFields = ['name', 'major', 'photo_url'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(currentUser.uid)
      .update(filteredUpdates);
    
    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Update user profile error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Remove profile picture
 */
export const removeProfilePicture = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(currentUser.uid)
      .update({
        photo_url: null,
      });
    
    return {
      success: true,
      message: 'Profile picture removed',
    };
  } catch (error) {
    console.error('Remove profile picture error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Listen to user profile changes
 */
export const listenToUserProfile = (uid, callback) => {
  return firestore()
    .collection(COLLECTIONS.USERS)
    .doc(uid)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({ success: true, userData: doc.data() });
        } else {
          callback({ success: false, error: 'User not found' });
        }
      },
      (error) => {
        console.error('Listen to user profile error:', error);
        callback({ success: false, error: error.message });
      }
    );
};

/**
 * Check if user has voted in an election
 */
export const hasUserVotedInElection = async (electionId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    const voteDoc = await firestore()
      .collection(COLLECTIONS.VOTES)
      .where('election_id', '==', electionId)
      .where('user_id', '==', currentUser.uid)
      .limit(1)
      .get();
    
    return {
      success: true,
      hasVoted: !voteDoc.empty,
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
 * Check if user has voted in a poll
 */
export const hasUserVotedInPoll = async (pollId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    const voteDoc = await firestore()
      .collection(COLLECTIONS.POLL_VOTES)
      .where('poll_id', '==', pollId)
      .where('user_id', '==', currentUser.uid)
      .limit(1)
      .get();
    
    return {
      success: true,
      hasVoted: !voteDoc.empty,
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
 * Get user's voting history for elections
 */
export const getUserElectionVotes = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    const votesSnapshot = await firestore()
      .collection(COLLECTIONS.VOTES)
      .where('user_id', '==', currentUser.uid)
      .orderBy('timestamp', 'desc')
      .get();
    
    const votes = [];
    votesSnapshot.forEach(doc => {
      votes.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      votes,
    };
  } catch (error) {
    console.error('Get user election votes error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user's voting history for polls
 */
export const getUserPollVotes = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    const votesSnapshot = await firestore()
      .collection(COLLECTIONS.POLL_VOTES)
      .where('user_id', '==', currentUser.uid)
      .orderBy('timestamp', 'desc')
      .get();
    
    const votes = [];
    votesSnapshot.forEach(doc => {
      votes.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      votes,
    };
  } catch (error) {
    console.error('Get user poll votes error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getUserProfile,
  getCurrentUserProfile,
  updateUserProfile,
  removeProfilePicture,
  listenToUserProfile,
  hasUserVotedInElection,
  hasUserVotedInPoll,
  getUserElectionVotes,
  getUserPollVotes,
};

