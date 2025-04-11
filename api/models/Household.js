const mongoose = require('mongoose');
const crypto = require('crypto');

const HouseholdSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a household name'],
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteCode: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Add these options to include virtuals when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false // Don't include virtual id property
});

// Generate invite code before saving
HouseholdSchema.pre('save', function (next) {
    if (!this.inviteCode) {
        // Generate a random invite code
        this.inviteCode = crypto.randomBytes(4).toString('hex');
    }
    next();
});

// Members foreign key reference
HouseholdSchema.virtual('members', {
    ref: 'User',
    localField: '_id',
    foreignField: 'household'
});
module.exports = mongoose.model('Household', HouseholdSchema);
