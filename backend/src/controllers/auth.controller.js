const crypto = require('crypto');
const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const env = require('../config/environment');
const User = require('../models/User');

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, preferredLanguage, referralCode } = req.body;

  if (!name || !email || !phone || !password) {
    return errorResponse(res, 400, 'Name, email, phone and password are required');
  }
  if (password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters');
  }

  const { user, token } = await authService.registerUser({ name, email, phone, password, preferredLanguage, referralCode });
  emailService.sendWelcomeEmail(user, preferredLanguage).catch(() => {});

  return successResponse(res, 201, 'Account created successfully', { user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }
  const { user, token } = await authService.loginUser({ email, password });
  return successResponse(res, 200, 'Logged in successfully', { user, token });
});

const logout = asyncHandler(async (req, res) => {
  // JWT is stateless - logout is handled client-side by discarding the token.
  return successResponse(res, 200, 'Logged out successfully');
});

const getProfile = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Profile fetched', { user: req.user.toSafeJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'whatsappNumber', 'avatar', 'preferredLanguage'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  return successResponse(res, 200, 'Profile updated', { user: user.toSafeJSON() });
});

const addAddress = asyncHandler(async (req, res) => {
  const { label, city, neighborhood, address, landmark, phone, deliveryInstructions, isDefault } = req.body;
  if (!neighborhood || !address || !phone) {
    return errorResponse(res, 400, 'Neighborhood, address and phone are required');
  }

  const user = await User.findById(req.user._id);
  if (isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push({
    label, city: city || 'Buea', neighborhood, address, landmark, phone, deliveryInstructions, isDefault: !!isDefault,
  });
  await user.save();

  return successResponse(res, 201, 'Address added', { addresses: user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  return successResponse(res, 200, 'Address removed', { addresses: user.addresses });
});

// Forgot password: generate a secure token, store it, and email a reset link.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase(), role: { $ne: 'guest' } });

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = (env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    const resetLink = `${clientUrl}/reset-password/${token}`;
    emailService.sendPasswordResetEmail(user, resetLink, user.preferredLanguage || 'en').catch(() => {});
  }
  // Always respond the same way to avoid leaking account existence.
  return successResponse(res, 200, 'If an account exists for this email, a reset link has been sent.');
});

// Reset password using a valid token from the emailed link.
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return errorResponse(res, 400, 'Reset token is required');
  }
  if (!password || password.length < 6) {
    return errorResponse(res, 400, 'New password must be at least 6 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired reset link. Please request a new one.');
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return successResponse(res, 200, 'Password reset successfully. You can now sign in with your new password.');
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
};
