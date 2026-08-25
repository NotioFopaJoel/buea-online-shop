const cloudinary = require('cloudinary').v2;
const env = require('./environment');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Whether Cloudinary credentials are actually configured. Used by the upload
 * controller to fail with a clear, actionable message instead of a cryptic
 * SDK error when someone forgets to set the env vars.
 */
function isCloudinaryConfigured() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

module.exports = cloudinary;
module.exports.isCloudinaryConfigured = isCloudinaryConfigured;
