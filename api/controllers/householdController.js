const User = require('../models/User');
const Household = require('../models/Household');

// @desc    Get household details
// @route   GET /api/households
// @access  Private
exports.getHousehold = async (req, res) => {
    try {
        const household = await Household.findById(req.user.household)
            .populate('members', 'name email');

        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }

        res.json(household);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update household
// @route   PUT /api/households
// @access  Private (owner only)
exports.updateHousehold = async (req, res) => {
    try {
        let household = await Household.findById(req.user.household);

        // Check if user is the household owner
        if (household.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the household owner can update details' });
        }

        household = await Household.findByIdAndUpdate(
            req.user.household,
            { name: req.body.name },
            { new: true, runValidators: true }
        );

        res.json(household);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Generate new invite code
// @route   POST /api/households/invite
// @access  Private (owner only)
exports.generateInviteCode = async (req, res) => {
    try {
        let household = await Household.findById(req.user.household);

        // Check if user is the household owner
        if (household.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the household owner can generate invite codes' });
        }

        // Generate new invite code
        household.inviteCode = undefined; // This will trigger pre-save hook to generate new code
        await household.save();

        res.json({ inviteCode: household.inviteCode });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Join household with invite code
// @route   POST /api/households/join
// @access  Private
exports.joinHousehold = async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({ message: 'Please provide an invite code' });
        }

        // Find household with invite code
        const household = await Household.findOne({ inviteCode });

        if (!household) {
            return res.status(400).json({ message: 'Invalid invite code' });
        }

        // Check if user is already in a household
        if (req.user.household) {
            // Leave current household
            const currentHousehold = await Household.findById(req.user.household);
            if (currentHousehold) {
                currentHousehold.members = currentHousehold.members.filter(
                    member => member.toString() !== req.user.id
                );
                await currentHousehold.save();
            }
        }

        // Add user to new household
        if (!household.members.includes(req.user.id)) {
            household.members.push(req.user.id);
            await household.save();
        }

        // Update user's household reference
        req.user.household = household._id;
        await req.user.save();

        res.json({
            message: `Successfully joined ${household.name}`,
            household
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Remove member from household
// @route   DELETE /api/households/members/:userId
// @access  Private (owner only)
exports.removeMember = async (req, res) => {
    try {
        console.log(req.params.userId);
        const household = await Household.findById(req.user.household)
        .populate('members', 'name email');

        // Check if user is the household owner
        if (household.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the household owner can remove members' });
        }

        // Cannot remove owner
        if (req.params.userId === household.owner.toString()) {
            return res.status(400).json({ message: 'Cannot remove the household owner' });
        }

        // Check if user exists in household
        if (!household.members.some(member => member._id.toString() === req.params.userId)) {
            return res.status(400).json({ message: 'User is not a member of this household' });
        }

        // Remove from members array
        household.members = household.members.filter(
            member => member.toString() !== req.params.userId
        );
        await household.save();

        // Update removed user's household reference
        await User.findByIdAndUpdate(req.params.userId, { household: null });

        res.json({ message: 'Member removed from household' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new household
// @route   POST /api/households
// @access  Private
exports.createHousehold = async (req, res) => {
    try {
        let { name } = req.body;

        // Use "Family" as default name if none provided
        if (!name) {
            name = "Family";
        }

        // Create household with the user as owner
        const household = new Household({
            name,
            owner: req.user._id,
            members: [req.user._id]
        });

        const savedHousehold = await household.save();

        // Update user's household reference
        req.user.household = savedHousehold._id;
        await req.user.save();

        res.status(201).json(savedHousehold);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
