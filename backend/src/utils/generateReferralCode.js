const crypto = require('crypto');

/**
 * Generates a unique referral code for a user.
 * Format: first 3 letters of name + 4 alphanumeric chars.
 * Retries on collision (extremely unlikely).
 */
async function generateReferralCode(User, name) {
  const prefix = (name || 'USR').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  let attempts = 0;
  let code;

  do {
    const random = crypto.randomBytes(3).toString('base64url').substring(0, 4).toUpperCase();
    code = `${prefix}${random}`;
    attempts += 1;
  } while (
    await User.exists({ referralCode: code })
    && attempts < 10
  );

  if (attempts >= 10) {
    const fallback = crypto.randomBytes(6).toString('base64url').substring(0, 7).toUpperCase();
    code = `BOS${fallback}`;
  }

  return code;
}

module.exports = generateReferralCode;
