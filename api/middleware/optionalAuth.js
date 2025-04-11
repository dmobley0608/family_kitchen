const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Optional authentication middleware
 * Attaches user to req.user if valid token is present
 * Does not block the request if no token or invalid token
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];

            // Verify token and attach user to request
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    req.user = await User.findById(decoded.id).populate('household');
                } catch (error) {
                    console.log('Invalid token, continuing as guest');
                }
            }
        }

        // Continue to the next middleware regardless of authentication
        next();
    } catch (error) {
        console.error('Error in optional auth middleware:', error);
        // Continue anyway since this is optional auth
        next();
    }
};

module.exports = optionalAuth;
