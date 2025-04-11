const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect, checkRecipeAccess } = require('../middleware/auth');
const { handleUpload } = require('../utils/fileUpload');

// Public routes
router.get('/', recipeController.getAllRecipes);
router.get('/:id', checkRecipeAccess, recipeController.getRecipeById);

// Protected routes - require authentication
router.post('/', protect, handleUpload('image'), recipeController.createRecipe);
router.put('/:id', protect, handleUpload('image'), checkRecipeAccess, recipeController.updateRecipe);
router.delete('/:id', protect, checkRecipeAccess, recipeController.deleteRecipe);

// Image upload route
router.post('/upload-image', protect, handleUpload('image'), recipeController.uploadRecipeImage);

module.exports = router;
