const express = require('express');
const {
    getHousehold,
    updateHousehold,
    generateInviteCode,
    joinHousehold,
    removeMember
} = require('../controllers/householdController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getHousehold);
router.put('/', updateHousehold);
router.post('/invite', generateInviteCode);
router.post('/join', joinHousehold);
router.delete('/members/:userId', removeMember);

module.exports = router;
