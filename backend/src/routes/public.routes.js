const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Used by the checkout page to populate the Buea neighborhood selector
// and to display "Free delivery from X FCFA" messaging (brief #46, #47, #63).
router.get('/delivery-zones', adminController.getPublicDeliveryZones);
router.get('/settings', adminController.getPublicSettings);

module.exports = router;
