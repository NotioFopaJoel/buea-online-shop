const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect, adminOnly);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/status', userController.updateUserStatus);
router.put('/:id/role', userController.updateUserRole);
router.put('/:id/approve-seller', userController.approveSeller);

module.exports = router;
