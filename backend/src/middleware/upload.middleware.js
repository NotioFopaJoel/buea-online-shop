const multer = require('multer');
const path = require('path');

// Memory storage: multer gives us the file as a Buffer (req.file.buffer)
// instead of writing it to disk. The upload controller streams that buffer
// straight to Cloudinary, so nothing depends on the local filesystem - which
// matters on hosts like Render's free tier where local disk doesn't persist
// across restarts/redeploys.
const storage = multer.memoryStorage();

const imageTypes = /jpeg|jpg|png|webp/;

function imageFileFilter(req, file, cb) {
  const extValid = imageTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = imageTypes.test(file.mimetype);
  if (extValid && mimeValid) return cb(null, true);
  cb(new Error('Only .jpeg, .jpg, .png and .webp image files are allowed'));
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

// Videos need a more permissive type check and a bigger size cap - used for
// homepage advertisement clips (kept short, ~10s, but still much larger than a photo).
const videoTypes = /mp4|webm|mov|quicktime/;

function videoFileFilter(req, file, cb) {
  const extValid = videoTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = videoTypes.test(file.mimetype) || file.mimetype === 'video/quicktime';
  if (extValid && mimeValid) return cb(null, true);
  cb(new Error('Only .mp4, .webm and .mov video files are allowed'));
}

const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
});

module.exports = upload;
module.exports.uploadVideo = uploadVideo;
