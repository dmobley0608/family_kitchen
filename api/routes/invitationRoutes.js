const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const invitationController = require('../controllers/invitationController');

// Protected routes - require authentication
router.post('/', protect, invitationController.sendInvitation);
router.get('/sent', protect, invitationController.getUserInvitations);
router.post('/resend/:invitationId', protect, invitationController.resendInvitation); // Add this line

// Routes with optional authentication
router.get('/verify/:token', optionalAuth, invitationController.verifyInvitation);
router.post('/accept/:token', optionalAuth, invitationController.acceptInvitation);

module.exports = router;
