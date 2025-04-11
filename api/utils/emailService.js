const SparkPost = require('sparkpost');

// Enhanced error handling and debugging for email service
const sendHouseholdInvitation = async (options) => {
    try {
        // Check if API key is configured
        if (!process.env.SPARKPOST_API_KEY) {
            console.error('SPARKPOST_API_KEY is not configured in environment variables');
            throw new Error('SparkPost API key is not configured');
        }

        // Create client
        const client = new SparkPost(process.env.SPARKPOST_API_KEY, {
            debug: false
        });

        console.log(`Preparing to send email to ${options.email}`);


        const fromEmail = process.env.EMAIL_FROM || 'noreply@familykitchen.com';

        const emailOptions = {
            options: {
                // Sandbox mode should be false in production
                sandbox: false,
                // Add tracking options
                tracking: {
                    opens: true,
                    clicks: true
                }
            },
            content: {
                from: fromEmail,
                subject: `${options.inviterName} invited you to join their Family Kitchen household`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4a6c6f;">You've Been Invited!</h2>
            <p>${options.inviterName} has invited you to join their household "<strong>${options.householdName}</strong>" on Family Kitchen.</p>
            <p>Click the button below to accept the invitation and create an account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${options.inviteLink}" style="background-color: #4a6c6f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
            </div>
            <p style="color: #666; font-size: 14px;">This invitation link will expire in 7 days.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        `,
                text: `
          Hello!

          ${options.inviterName} has invited you to join their household "${options.householdName}" on Family Kitchen.

          Accept the invitation by visiting this link:
          ${options.inviteLink}

          This invitation link will expire in 7 days.

          If you didn't expect this invitation, you can safely ignore this email.

          Thanks,
          The Family Kitchen Team
        `
            },
            recipients: [
                { address: options.email }
            ]
        };


        try {
            const result = await client.transmissions.send(emailOptions);
            console.log('Email sent successfully:', result);
            return {
                success: true,
                inviteLink: options.inviteLink
            };
        } catch (sparkPostError) {
            console.error('SparkPost error details:', sparkPostError);

            // Check for specific SparkPost errors
            if (sparkPostError.statusCode === 403) {
                console.error('SparkPost API key not authorized. Check your permissions.');
            } else if (sparkPostError.statusCode === 404) {
                console.error('SparkPost API endpoint not found.');
            }

            throw sparkPostError;
        }
    } catch (error) {
        console.error('Failed to send invitation email:', error);
        // Don't throw the error to prevent affecting the invitation flow
        // Just log it so we can diagnose without breaking the app
        return {
            success: false,
            error: error.message,
            inviteLink: options.inviteLink // Return link anyway for fallback display
        };
    }
};

// Password reset email function
const sendPasswordResetEmail = async (options) => {
    try {
        // Check if API key is configured
        if (!process.env.SPARKPOST_API_KEY) {
            console.error('SPARKPOST_API_KEY is not configured in environment variables');
            throw new Error('SparkPost API key is not configured');
        }

        // Create client
        const client = new SparkPost(process.env.SPARKPOST_API_KEY, {
            debug: false
        });

        console.log(`Preparing to send password reset email to ${options.email}`);

        const fromEmail = process.env.EMAIL_FROM || 'noreply@familykitchen.com';

        const emailOptions = {
            options: {
                sandbox: false,
                tracking: {
                    opens: true,
                    clicks: true
                }
            },
            content: {
                from: fromEmail,
                subject: 'Password Reset - Family Kitchen',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4a6c6f;">Password Reset Request</h2>
            <p>You've requested to reset your password for your Family Kitchen account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${options.resetUrl}" style="background-color: #4a6c6f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">This password reset link will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
        `,
                text: `
          Hello!

          You've requested to reset your password for your Family Kitchen account.

          Reset your password by visiting this link:
          ${options.resetUrl}

          This reset link will expire in 10 minutes.

          If you didn't request this, please ignore this email or contact support if you have concerns.

          Thanks,
          The Family Kitchen Team
        `
            },
            recipients: [
                { address: options.email }
            ]
        };

        try {
            const result = await client.transmissions.send(emailOptions);
            console.log('Password reset email sent successfully:', result);
            return {
                success: true
            };
        } catch (sparkPostError) {
            console.error('SparkPost error details:', sparkPostError);
            throw sparkPostError;
        }
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendHouseholdInvitation,
    sendPasswordResetEmail
};
