/**
 * Validates email structure
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates phone numbers (10 digits)
 */
export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(String(phone));
};

/**
 * Validates PAN Card numbers (e.g. ABCDE1234F)
 */
export const validatePan = (pan) => {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(String(pan).toUpperCase());
};

/**
 * Validates Aadhaar card number (12 digits)
 */
export const validateAadhar = (aadhar) => {
  const re = /^\d{12}$/;
  return re.test(String(aadhar));
};

/**
 * Validates Indian Financial System Code (IFSC) (e.g. UTIB0000001, HDFC0000010)
 */
export const validateIfsc = (ifsc) => {
  const re = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return re.test(String(ifsc).toUpperCase());
};

/**
 * Checks password strength
 * Returns a score from 0 to 4
 */
export const checkPasswordStrength = (password) => {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};
