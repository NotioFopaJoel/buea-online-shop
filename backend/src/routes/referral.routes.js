const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// Customer: get own referral info
router.get('/me', protect, referralController.getMyReferral);

// Admin routes
router.get('/settings', protect, adminOnly, referralController.getReferralSettings);
router.put('/settings', protect, adminOnly, referralController.updateReferralSettings);
router.get('/stats', protect, adminOnly, referralController.getReferralStats);
router.get('/', protect, adminOnly, referralController.getReferrers);

module.exports = router;
