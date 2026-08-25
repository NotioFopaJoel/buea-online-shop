const express = require('express');
const router = express.Router();
const adController = require('../controllers/advertisement.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// Public - homepage carousel + impression/click tracking
router.get('/active', adController.getActiveAdvertisements);
router.post('/:id/view', adController.trackView);
router.post('/:id/click', adController.trackClick);

// Admin - full management
router.get('/', protect, adminOnly, adController.getAllAdvertisements);
router.post('/', protect, adminOnly, adController.createAdvertisement);
router.put('/:id', protect, adminOnly, adController.updateAdvertisement);
router.delete('/:id', protect, adminOnly, adController.deleteAdvertisement);

module.exports = router;
