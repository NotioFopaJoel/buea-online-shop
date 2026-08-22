const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// Guest checkout allowed: optionalAuth attaches req.user only if a token is present
router.post('/', optionalAuth, orderController.createOrder);

// Public order tracking by order number (brief #12: "Track Your Order")
router.get('/track/:orderNumber', orderController.trackOrder);

router.get('/', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);

// Self-service: the customer's own client marks that they opened the WhatsApp
// link right after checkout - not a privileged action, so any authenticated
// (or guest, via optionalAuth upstream in createOrder) request is fine here.
router.put('/:id/whatsapp-status', protect, orderController.updateWhatsAppStatus);

// Privileged: changing an order's fulfillment status or payment status must be
// restricted to admins. Without adminOnly here, any logged-in customer could
// call these endpoints directly (bypassing the UI) and alter ANY order.
router.put('/:id/status', protect, adminOnly, orderController.updateOrderStatus);
router.put('/:id/payment-status', protect, adminOnly, orderController.updatePaymentStatus);

module.exports = router;
