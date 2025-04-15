const mongoose = require('mongoose');
const crypto = require('crypto');

const InvitationSchema = new mongoose.Schema({
    household: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expires: {
        type: Date,
        required: true,
        default: function () {
            // Default expiration: 7 days from now
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
    },
    accepted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Fix the pre-save hook
InvitationSchema.pre('save', function (next) {
    // Only generate token if it's not set yet (for new documents)
    if (!this.token) {
        this.token = require('crypto').randomBytes(32).toString('hex');
       
    }
    next();
});

module.exports = mongoose.model('Invitation', InvitationSchema);
