const Household = require('../models/Household');
const Invitation = require('../models/Invitation');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Check if email is already taken by another user
        if (email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        // Update user
        req.user.name = name || req.user.name;
        req.user.email = email || req.user.email;

        await req.user.save();

        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            household: req.user.household
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Check if current password is correct
        const user = await User.findById(req.user.id).select('+password');
        const isMatch = await user.matchPassword(`${currentPassword}`);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Remove Account
exports.removeAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id).populate('household');
        // Check if user was found and deleted
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        //Delete Recipes
        await Recipe.deleteMany({ user: req.user.id });
        //Delete Invitations
        await Invitation.deleteMany({ user: req.user.id });
        //Change Household Owner if needed
        if (user.household.owner.toString() === user._id.toString()) {
            const newOwner = await User.findOne({ household: user.household }).sort({ createdAt: 1 });
        
            if (newOwner) {
                newOwner.household.owner = newOwner._id;
                await newOwner.save();
            }else{
                await Household.findByIdAndDelete(user.household._id);
            }
        }


        res.json({ message: 'User account removed successfully' });
    } catch (error) {
        console.error('Remove account error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}