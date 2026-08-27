const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
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

// Simplified forgot/reset password flow (token generation only - email delivery is a TODO
// once EMAIL_* credentials are configured in .env, see email.service.js).
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  // Always respond the same way whether or not the user exists, to avoid leaking account existence.
  if (user) {
    // TODO: generate a real reset token + send email via email.service.js
    console.log(`[auth] Password reset requested for ${user.email}`);
  }
  return successResponse(res, 200, 'If an account exists for this email, a reset link has been sent.');
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
};
