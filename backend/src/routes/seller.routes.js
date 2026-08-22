const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller.controller');
const { protect } = require('../middleware/auth.middleware');
const { sellerOnly } = require('../middleware/seller.middleware');

router.use(protect, sellerOnly);

router.get('/dashboard', sellerController.getSellerDashboard);
router.get('/orders', sellerController.getSellerOrders);
router.get('/earnings', sellerController.getSellerEarnings);

module.exports = router;
