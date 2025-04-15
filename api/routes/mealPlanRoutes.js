const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const { protect} = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// Get all meal plans for user's household
router.get('/', mealPlanController.getMealPlans);

// Get meal plan by ID
router.get('/:id', mealPlanController.getMealPlanById);

// Create a new meal plan
router.post('/', mealPlanController.createMealPlan);

// Update a meal plan
router.put('/:id', mealPlanController.updateMealPlan);

// Delete a meal plan
router.delete('/:id', mealPlanController.deleteMealPlan);

// Add a meal to a meal plan
router.post('/:id/meals', mealPlanController.addMeal);

// Remove a meal from a meal plan
router.delete('/:id/meals/:mealId', mealPlanController.removeMeal);

module.exports = router;
