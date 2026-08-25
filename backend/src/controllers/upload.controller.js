const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const cloudinary = require('../config/cloudinary');
const { isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Streams an in-memory file buffer straight to Cloudinary - no temp file,
 * no local disk involved at any point. Returns the Cloudinary upload result,
 * whose secure_url is what gets stored on the Product/Advertisement document.
 */
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

function assertCloudinaryConfigured(res) {
  if (!isCloudinaryConfigured()) {
    errorResponse(res, 500, 'Image/video storage is not configured yet. Ask the site administrator to set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
    return false;
  }
  return true;
}

/**
 * POST /api/upload/image - single image (used by the "Choose photo from device" field)
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!assertCloudinaryConfigured(res)) return;
  if (!req.file) return errorResponse(res, 400, 'No image file received');

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'buea-online-shop/products',
    resource_type: 'image',
  });
  return successResponse(res, 201, 'Image uploaded', { url: result.secure_url });
});

/**
 * POST /api/upload/images - multiple images at once (up to 6), for future multi-photo galleries
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!assertCloudinaryConfigured(res)) return;
  if (!req.files || !req.files.length) return errorResponse(res, 400, 'No image files received');

  const results = await Promise.all(
    req.files.map((file) => uploadBufferToCloudinary(file.buffer, {
      folder: 'buea-online-shop/products',
      resource_type: 'image',
    }))
  );
  return successResponse(res, 201, 'Images uploaded', { urls: results.map((r) => r.secure_url) });
});

/**
 * POST /api/upload/video - single video (used for advertisement clips)
 */
const uploadVideo = asyncHandler(async (req, res) => {
  if (!assertCloudinaryConfigured(res)) return;
  if (!req.file) return errorResponse(res, 400, 'No video file received');

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'buea-online-shop/advertisements',
    resource_type: 'video',
  });
  return successResponse(res, 201, 'Video uploaded', { url: result.secure_url });
});

module.exports = { uploadImage, uploadImages, uploadVideo };
