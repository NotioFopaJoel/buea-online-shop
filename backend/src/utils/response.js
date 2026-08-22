/**
 * Standardized success response shape used across the whole API.
 */
function successResponse(res, statusCode, message, data = null, meta = null) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

/**
 * Standardized error response shape used across the whole API.
 */
function errorResponse(res, statusCode, message, errors = null) {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

/**
 * Wraps an async route handler so thrown errors are forwarded to
 * the centralized error middleware instead of crashing the process.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { successResponse, errorResponse, asyncHandler };
