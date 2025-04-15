const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Household = require('../models/Household');
const { sendHouseholdInvitation } = require('../utils/emailService');

// Controller methods
const invitationController = {
    // Send a household invitation
    sendInvitation: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            // Check if user has a household
            if (!req.user.household) {
                return res.status(400).json({ message: 'You need to be part of a household to invite others' });
            }

            // Get user's household
            const household = await Household.findById(req.user.household);
            if (!household) {
                return res.status(404).json({ message: 'Household not found' });
            }

            // Check if email already has an active invitation for this household
            const existingInvitation = await Invitation.findOne({
                email,
                household: household._id,
                accepted: false,
                expires: { $gt: Date.now() }
            });

            if (existingInvitation) {
                return res.status(400).json({
                    message: 'An active invitation already exists for this email',
                    invitation: existingInvitation
                });
            }

            // Check if user with this email already exists and is in the household
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser.household && existingUser.household.toString() === household._id.toString()) {
                return res.status(400).json({ message: 'This user is already part of your household' });
            }

            // Create invitation
            const invitation = new Invitation({
                household: household._id,
                invitedBy: req.user._id,
                email,
                token: require('crypto').randomBytes(32).toString('hex') // Generate token here directly
            });

            const savedInvitation = await invitation.save();

            try {
                // Create invitation link
                const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join-household/${savedInvitation.token}`;

               
                // Send invitation email with enhanced error handling
                const emailResult = await sendHouseholdInvitation({
                    email,
                    inviterName: req.user.name,
                    householdName: household.name,
                    inviteLink
                });

                // Return invitation information including the link for direct sharing
                res.status(201).json({
                    message: emailResult.success
                        ? 'Invitation sent successfully'
                        : 'Invitation created but the email might be delayed. You can share the link directly.',
                    invitation: savedInvitation,
                    inviteLink: inviteLink,
                    emailStatus: emailResult.success ? 'sent' : 'pending'
                });
            } catch (error) {
                console.error('Error sending invitation email:', error);
                res.status(500).json({ message: 'Server Error', error: error.message });
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Verify an invitation token
    verifyInvitation: async (req, res) => {
        try {
            const { token } = req.params;

            const invitation = await Invitation.findOne({
                token,
                accepted: false,
                expires: { $gt: Date.now() }
            })
                .populate('household', 'name')
                .populate('invitedBy', 'name');

            if (!invitation) {
                return res.status(400).json({ message: 'Invalid or expired invitation' });
            }

            res.json({
                message: 'Valid invitation',
                invitation: {
                    email: invitation.email,
                    householdName: invitation.household.name,
                    invitedBy: invitation.invitedBy.name,
                    expires: invitation.expires
                }
            });
        } catch (error) {
            console.error('Error verifying invitation:', error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Accept an invitation (for existing users)
    acceptInvitation: async (req, res) => {
        try {
            const { token } = req.params;
            const invitation = await Invitation.findOne({
                token,
                accepted: false,
                expires: { $gt: Date.now() }
            }).populate('household');

            if (!invitation) {
                return res.status(400).json({ message: 'Invalid or expired invitation' });
            }

            // If user is not logged in, return information for registration
            if (!req.user) {
                return res.status(401).json({
                    message: 'Authentication required to accept invitation',
                    invitation: {
                        email: invitation.email,
                        token: invitation.token
                    }
                });
            }

            // Only the invited email can accept
            if (req.user.email !== invitation.email) {
                return res.status(403).json({ message: 'This invitation is for a different email address' });
            }
            // Update user's household
            req.user.household = invitation.household._id;
            await req.user.save();

            // Mark invitation as accepted
            invitation.accepted = true;
            await invitation.save();

            res.json({
                message: 'Successfully joined household',
                household: invitation.household
            });
        } catch (error) {
            console.error('Error accepting invitation:', error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Get all invitations sent by the user
    getUserInvitations: async (req, res) => {
        try {
            const invitations = await Invitation.find({ invitedBy: req.user._id })
                .sort({ createdAt: -1 })
                .populate('household', 'name');

            res.json(invitations);
        } catch (error) {
            console.error('Error getting invitations:', error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Resend an invitation
    resendInvitation: async (req, res) => {
        try {
            const { invitationId } = req.params;

            // Find the invitation
            const invitation = await Invitation.findById(invitationId)
                .populate('household')
                .populate('invitedBy');

            if (!invitation) {
                return res.status(404).json({ message: 'Invitation not found' });
            }

            // Verify the user is the one who sent the invitation or household owner
            const household = await Household.findById(invitation.household._id);
            const isAllowed =
                invitation.invitedBy.toString() === req.user._id.toString() ||
                household.owner.toString() === req.user._id.toString();

            if (!isAllowed) {
                return res.status(403).json({ message: 'You are not authorized to resend this invitation' });
            }

            // Check if invitation is already accepted
            if (invitation.accepted) {
                return res.status(400).json({ message: 'This invitation has already been accepted' });
            }

            // Update the invitation with new token and expiration date
            invitation.token = require('crypto').randomBytes(32).toString('hex');
            invitation.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // New 7-day expiration

            const savedInvitation = await invitation.save();

            // Create invitation link
            const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join-household/${savedInvitation.token}`;

            // Send invitation email
            await sendHouseholdInvitation({
                email: invitation.email,
                inviterName: req.user.name,
                householdName: invitation.household.name,
                inviteLink
            });

            res.json({
                message: 'Invitation resent successfully',
                invitation: savedInvitation
            });
        } catch (error) {
            console.error('Error resending invitation:', error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

module.exports = invitationController;
