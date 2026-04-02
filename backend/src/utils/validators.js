/**
 * Input validation utilities.
 * Provides reusable validation functions for request data.
 */

const VALID_ROLES = ['VIEWER', 'ANALYST', 'ADMIN'];
const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];
const VALID_TYPES = ['income', 'expense'];

/**
 * Validates user creation data.
 */
function validateUser(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('A valid email is required.');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password is required and must be at least 6 characters.');
  }

  if (data.role && !VALID_ROLES.includes(data.role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  return errors;
}

/**
 * Validates financial record data.
 */
function validateRecord(data) {
  const errors = [];

  if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
    errors.push('Amount is required and must be greater than 0.');
  }

  if (!data.type || !VALID_TYPES.includes(data.type)) {
    errors.push(`Type is required and must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Category is required.');
  }

  if (!data.date || !isValidDate(data.date)) {
    errors.push('A valid date is required (YYYY-MM-DD format).');
  }

  return errors;
}

/**
 * Validates record update data (partial update allowed).
 */
function validateRecordUpdate(data) {
  const errors = [];

  if (data.amount !== undefined && (isNaN(data.amount) || parseFloat(data.amount) <= 0)) {
    errors.push('Amount must be greater than 0.');
  }

  if (data.type !== undefined && !VALID_TYPES.includes(data.type)) {
    errors.push(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (data.category !== undefined && (typeof data.category !== 'string' || data.category.trim().length === 0)) {
    errors.push('Category cannot be empty.');
  }

  if (data.date !== undefined && !isValidDate(data.date)) {
    errors.push('Date must be in YYYY-MM-DD format.');
  }

  return errors;
}

/**
 * Validates user update data.
 */
function validateUserUpdate(data) {
  const errors = [];

  if (data.role !== undefined && !VALID_ROLES.includes(data.role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length < 2)) {
    errors.push('Name must be at least 2 characters.');
  }

  return errors;
}

// --- Helper functions ---

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateStr) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

module.exports = {
  validateUser,
  validateRecord,
  validateRecordUpdate,
  validateUserUpdate,
  VALID_ROLES,
  VALID_STATUSES,
  VALID_TYPES,
};
