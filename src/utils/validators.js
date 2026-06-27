/**
 * validators.js
 * -------------
 * Client-side validation helpers used in LoginPage and SignupPage.
 * Mirror these rules on the backend too (never trust client-only validation).
 */

/** Valid email format */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

/**
 * Valid Indian mobile number
 * - exactly 10 digits
 * - starts with 6, 7, 8, or 9
 */
export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(String(phone).replace(/\s/g, ''));

/**
 * Valid password
 * - minimum 6 characters
 * - at least one numeric digit
 */
export const isValidPassword = (password) =>
  String(password).length >= 6 && /\d/.test(String(password));

/** Non-empty name with at least 2 characters */
export const isValidName = (name) =>
  String(name).trim().length >= 2;

/** Pincode — 6 digits */
export const isValidPincode = (pin) =>
  /^\d{6}$/.test(String(pin).trim());