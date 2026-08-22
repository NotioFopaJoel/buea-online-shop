const { errorResponse } = require('../utils/response');

/**
 * Must be used AFTER auth.middleware.protect.
 * Restricts a route to users with role === 'admin'.
 */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied: admin privileges required');
  }
  next();
}

module.exports = { adminOnly };
