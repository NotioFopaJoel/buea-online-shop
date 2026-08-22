const { errorResponse } = require('../utils/response');

/**
 * Must be used AFTER auth.middleware.protect.
 * Restricts a route to approved sellers, or admins (who can manage everything).
 */
function sellerOnly(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 401, 'Not authorized');
  }
  if (req.user.role === 'admin') return next();
  if (req.user.role !== 'seller') {
    return errorResponse(res, 403, 'Access denied: seller account required');
  }
  if (!req.user.sellerProfile || !req.user.sellerProfile.isApproved) {
    return errorResponse(res, 403, 'Your seller account is pending admin approval');
  }
  next();
}

module.exports = { sellerOnly };
