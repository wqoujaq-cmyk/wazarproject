// Validation Utilities

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate university ID format
 * Expected format: Letters followed by numbers (e.g., ENG001, MED123)
 */
export const validateUniversityId = (universityId) => {
  if (!universityId || universityId.trim().length === 0) {
    return { valid: false, message: 'University ID is required' };
  }
  
  if (universityId.length < 3) {
    return { valid: false, message: 'University ID must be at least 3 characters' };
  }
  
  // Allow alphanumeric characters
  const idRegex = /^[A-Z0-9]+$/i;
  if (!idRegex.test(universityId)) {
    return { valid: false, message: 'University ID can only contain letters and numbers' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

/**
 * Validate name (at least 2 characters)
 */
export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate faculty selection
 */
export const validateFaculty = (faculty) => {
  if (!faculty) {
    return { valid: false, message: 'Please select a faculty' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate major
 */
export const validateMajor = (major) => {
  if (!major || major.trim().length < 2) {
    return { valid: false, message: 'Major must be at least 2 characters' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate registration form
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.message;
  }
  
  // Validate university ID
  const universityIdValidation = validateUniversityId(formData.universityId);
  if (!universityIdValidation.valid) {
    errors.universityId = universityIdValidation.message;
  }
  
  // Validate faculty
  const facultyValidation = validateFaculty(formData.faculty);
  if (!facultyValidation.valid) {
    errors.faculty = facultyValidation.message;
  }
  
  // Validate major
  const majorValidation = validateMajor(formData.major);
  if (!majorValidation.valid) {
    errors.major = majorValidation.message;
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }
  
  // Validate password match
  const passwordMatchValidation = validatePasswordMatch(
    formData.password,
    formData.confirmPassword
  );
  if (!passwordMatchValidation.valid) {
    errors.confirmPassword = passwordMatchValidation.message;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Validate university ID
  const universityIdValidation = validateRequired(formData.universityId, 'University ID');
  if (!universityIdValidation.valid) {
    errors.universityId = universityIdValidation.message;
  }
  
  // Validate password
  const passwordValidation = validateRequired(formData.password, 'Password');
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateUniversityId,
  validateRequired,
  validateName,
  validateFaculty,
  validateMajor,
  validatePasswordMatch,
  validateRegistrationForm,
  validateLoginForm,
};

