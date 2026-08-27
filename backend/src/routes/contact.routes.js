const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { optionalAuth, protect } = require('../middleware/auth.middleware');

// Public - submit a contact form message (attaches user if logged in)
router.post('/', optionalAuth, contactController.createMessage);

// Customer - see own messages and admin replies (requires login)
router.get('/mine', protect, contactController.getMyMessages);

module.exports = router;
