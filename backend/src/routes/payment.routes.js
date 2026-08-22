const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.get('/order/:orderId', protect, paymentController.getPaymentByOrder);
router.put('/:id/confirm', protect, adminOnly, paymentController.confirmPayment);

module.exports = router;
