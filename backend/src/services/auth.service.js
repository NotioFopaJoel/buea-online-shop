const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function registerUser({ name, email, phone, password, preferredLanguage }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    preferredLanguage: preferredLanguage || 'en',
    role: 'customer',
  });

  const token = generateToken(user._id, user.role);
  return { user: user.toSafeJSON(), token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  if (!user.isActive) {
    const err = new Error('This account has been deactivated');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user._id, user.role);
  return { user: user.toSafeJSON(), token };
}

module.exports = { registerUser, loginUser };
