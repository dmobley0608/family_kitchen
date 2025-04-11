const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, userController.updateProfile);
router.put('/password', protect, userController.changePassword);
router.delete('/remove', protect, userController.removeAccount);

module.exports = router;