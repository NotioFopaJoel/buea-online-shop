export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

export function isValidCameroonPhone(phone) {
  // Accepts formats like +237670000000, 237670000000, 670000000
  const cleaned = (phone || '').replace(/[\s-]/g, '');
  return /^(\+?237)?[62]\d{8}$/.test(cleaned);
}

export function isNotEmpty(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined;
}

export function minLength(value, len) {
  return (value || '').length >= len;
}

export default { isValidEmail, isValidCameroonPhone, isNotEmpty, minLength };
