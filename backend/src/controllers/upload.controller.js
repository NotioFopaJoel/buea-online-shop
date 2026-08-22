const { asyncHandler, successResponse, errorResponse } = require('../utils/response');

/**
 * Builds an absolute URL to the uploaded file (e.g. http://localhost:5000/uploads/xxx.jpg).
 * Using an absolute URL (rather than a relative "/uploads/xxx.jpg" path) means the
 * image displays correctly in the frontend even though frontend and backend run
 * on different origins/ports in dev, and potentially different domains in production.
 */
function buildFileUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

/**
 * POST /api/upload/image - single image (used by the "Choose photo from device" field)
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 400, 'No image file received');
  return successResponse(res, 201, 'Image uploaded', { url: buildFileUrl(req, req.file.filename) });
});

/**
 * POST /api/upload/images - multiple images at once (up to 6), for future multi-photo galleries
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.length) return errorResponse(res, 400, 'No image files received');
  const urls = req.files.map((file) => buildFileUrl(req, file.filename));
  return successResponse(res, 201, 'Images uploaded', { urls });
});

module.exports = { uploadImage, uploadImages };
