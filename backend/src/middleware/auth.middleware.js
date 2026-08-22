const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * Verifies the JWT sent in the Authorization header (Bearer <token>).
 * Attaches the authenticated user document to req.user.
 */
async function protect(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'Not authorized, user no longer exists or is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized, invalid or expired token');
  }
}

/**
 * Optional auth: attaches req.user if a valid token is present,
 * but does NOT block the request if it's missing (used for guest checkout).
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch (error) {
    // Silently ignore invalid tokens for optional auth
  }
  next();
}

module.exports = { protect, optionalAuth };
