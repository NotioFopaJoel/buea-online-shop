const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect, adminOnly);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/orders', adminController.getAdminOrders);

router.get('/delivery-zones', adminController.getDeliveryZones);
router.post('/delivery-zones', adminController.createDeliveryZone);
router.put('/delivery-zones/:id', adminController.updateDeliveryZone);
router.delete('/delivery-zones/:id', adminController.deleteDeliveryZone);

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

module.exports = router;
