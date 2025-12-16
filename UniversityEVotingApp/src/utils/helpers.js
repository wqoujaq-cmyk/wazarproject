// Helper Utilities

/**
 * Format date to readable string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format date to short string (e.g., "Nov 13, 2025")
 */
export const formatDateShort = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Check if date is in the past
 */
export const isPastDate = (timestamp) => {
  if (!timestamp) return false;
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  
  return date < now;
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (timestamp) => {
  if (!timestamp) return false;
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  
  return date > now;
};

/**
 * Check if current time is between start and end dates
 */
export const isActiveNow = (startDate, endDate) => {
  const now = new Date();
  const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  
  return now >= start && now <= end;
};

/**
 * Get election/poll status based on dates
 */
export const getStatus = (startDate, endDate, manualStatus) => {
  // If manual status is 'draft', return it
  if (manualStatus === 'draft') {
    return 'draft';
  }
  
  const now = new Date();
  const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  
  if (now < start) {
    return 'scheduled';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'closed';
  }
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Check if user can vote in election based on faculty scope
 */
export const canUserVoteInElection = (userFaculty, election) => {
  if (!election) return false;
  
  // If user faculty is 'All' or 'Unknown', show all elections
  if (!userFaculty || userFaculty === 'All' || userFaculty === 'Unknown') {
    return true;
  }
  
  // If election is for all faculties
  if (election.faculty_scope_type === 'ALL_FACULTIES') {
    return true;
  }
  
  // If no scope specified, show to everyone
  if (!election.faculty_scope_type && !election.faculty_scope) {
    return true;
  }
  
  // If election has faculty scope array
  if (election.faculty_scope && Array.isArray(election.faculty_scope)) {
    return election.faculty_scope.includes(userFaculty);
  }
  
  return false;
};

/**
 * Check if user can vote in poll based on target faculties
 */
export const canUserVoteInPoll = (userFaculty, poll) => {
  if (!poll) return false;
  
  // If user faculty is 'All' or 'Unknown', show all polls
  if (!userFaculty || userFaculty === 'All' || userFaculty === 'Unknown') {
    return true;
  }
  
  // If poll is for all faculties
  if (poll.target_type === 'ALL_FACULTIES') {
    return true;
  }
  
  // If no scope specified, show to everyone
  if (!poll.target_type && !poll.target_faculties) {
    return true;
  }
  
  // If poll has target faculties array
  if (poll.target_faculties && Array.isArray(poll.target_faculties)) {
    return poll.target_faculties.includes(userFaculty);
  }
  
  return false;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return '#4CAF50'; // green
    case 'scheduled':
      return '#FF9800'; // orange
    case 'closed':
      return '#9E9E9E'; // gray
    case 'draft':
      return '#757575'; // dark gray
    default:
      return '#9E9E9E';
  }
};

/**
 * Get status label
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'scheduled':
      return 'Scheduled';
    case 'closed':
      return 'Closed';
    case 'draft':
      return 'Draft';
    default:
      return 'Unknown';
  }
};

/**
 * Convert Firestore timestamp to Date
 */
export const firestoreTimestampToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

/**
 * Delay function (for testing/loading states)
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export default {
  formatDate,
  formatDateShort,
  isPastDate,
  isFutureDate,
  isActiveNow,
  getStatus,
  calculatePercentage,
  truncateText,
  getInitials,
  canUserVoteInElection,
  canUserVoteInPoll,
  getStatusColor,
  getStatusLabel,
  firestoreTimestampToDate,
  delay,
  generateId,
};

