const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { sellerOnly } = require('../middleware/seller.middleware');

// sellerOnly allows both approved sellers and admins - exactly who is allowed
// to create/edit products and therefore needs to upload product photos.
router.post('/image', protect, sellerOnly, upload.single('image'), uploadController.uploadImage);
router.post('/images', protect, sellerOnly, upload.array('images', 6), uploadController.uploadImages);

module.exports = router;
