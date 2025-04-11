const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Protect routes - required authentication
exports.protect = async (req, res, next) => {
    // If user is already attached by optionalAuth middleware, just check if it exists
    if (req.user) {
        return next();
    }

    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user to request
        req.user = await User.findById(decoded.id).populate('household');
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

// Check if user belongs to household for recipe operations
exports.checkRecipeAccess = async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id);

    // If recipe doesn't exist
    if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
    }

    // Allow access if recipe is public
    if (!recipe.isPrivate) {
        req.recipe = recipe;
        return next();
    }

    if(!req.user) {
        return res.status(401).json({ message: 'Not authorized to access this recipe' });
    }   
    // Check if user is in the recipe's household
    const isInHousehold = req.user.household &&
        recipe.household &&
        req.user.household.toString() === recipe.household.toString();

    // Log for debugging
    console.log('User household:', req.user.household);
    console.log('Recipe household:', recipe.household);

    if (!isInHousehold) {
        return res.status(403).json({ message: 'Not authorized to access this recipe' });
    }

    req.recipe = recipe;
    next();
};
