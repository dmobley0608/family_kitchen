const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const { protect } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// Get all shopping lists for user's household
router.get('/', shoppingListController.getShoppingLists);

// Get shopping list by ID
router.get('/:id', shoppingListController.getShoppingListById);

// Create a new shopping list
router.post('/', shoppingListController.createShoppingList);

// Update a shopping list
router.put('/:id', shoppingListController.updateShoppingList);

// Delete a shopping list
router.delete('/:id', shoppingListController.deleteShoppingList);

// Add item to shopping list
router.post('/:id/items', shoppingListController.addItem);

// Remove item from shopping list
router.delete('/:id/items/:itemId', shoppingListController.removeItem);

// Toggle item purchased status
router.patch('/:id/items/:itemId/toggle', shoppingListController.toggleItemPurchased);

// Generate shopping list from meal plan
router.post('/generate-from-meal-plan', shoppingListController.generateFromMealPlan);

module.exports = router;
