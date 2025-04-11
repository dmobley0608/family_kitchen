const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', ingredientController.getAllIngredients);
router.get('/:id', ingredientController.getIngredientById);

// Protected routes
router.post('/', protect, ingredientController.createIngredient);

module.exports = router;
