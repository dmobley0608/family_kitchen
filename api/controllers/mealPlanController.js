const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

const mealPlanController = {
    // Get all meal plans for user's household
    getMealPlans: async (req, res) => {
        try {
            const mealPlans = await MealPlan.find({ household: req.user.household })
                .populate('meals.recipe', 'title prepTime cookTime image')
                .sort({ startDate: -1 });

            res.json(mealPlans);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Get meal plan by ID
    getMealPlanById: async (req, res) => {
        try {
            const { id } = req.params;
            const mealPlan = await MealPlan.findById(id)
                .populate('meals.recipe', 'title prepTime cookTime image ingredients')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            if (!mealPlan) {
                return res.status(404).json({ message: 'Meal plan not found' });
            }

            res.json(mealPlan);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Create a new meal plan
    createMealPlan: async (req, res) => {
        try {
            const { startDate, endDate, meals, notes } = req.body;

            const newMealPlan = new MealPlan({
                household: req.user.household,
                createdBy: req.user._id,
                startDate,
                endDate,
                meals: meals || [],
                notes
            });

            const savedMealPlan = await newMealPlan.save();
            const populatedMealPlan = await MealPlan.findById(savedMealPlan._id)
                .populate('meals.recipe', 'title prepTime cookTime image')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            res.status(201).json(populatedMealPlan);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update a meal plan
    updateMealPlan: async (req, res) => {
        try {
            const { id } = req.params;
            const { startDate, endDate, meals, notes } = req.body;

            const mealPlan = await MealPlan.findById(id);
            if (!mealPlan) {
                return res.status(404).json({ message: 'Meal plan not found' });
            }


            // Verify user has permission
            if (mealPlan.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this meal plan' });
            }

            const updatedMealPlan = await MealPlan.findByIdAndUpdate(
                id,
                { startDate, endDate, meals, notes },
                { new: true }
            ).populate('meals.recipe', 'title prepTime cookTime image')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            res.json(updatedMealPlan);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete a meal plan
    deleteMealPlan: async (req, res) => {
        try {
            const { id } = req.params;
            const mealPlan = await MealPlan.findById(id);

            if (!mealPlan) {
                return res.status(404).json({ message: 'Meal plan not found' });
            }

            // Verify user has permission
            if (mealPlan.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this meal plan' });
            }

            await MealPlan.findByIdAndDelete(id);
            res.json({ message: 'Meal plan deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Add a meal to a meal plan
    addMeal: async (req, res) => {
        try {
            const { id } = req.params;
            const { date, mealType, recipeId, notes } = req.body;

            const mealPlan = await MealPlan.findById(id);
            if (!mealPlan) {
                return res.status(404).json({ message: 'Meal plan not found' });
            }




            // Verify user has permission
            if (mealPlan.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this meal plan' });
            }

            // Add new meal
            mealPlan.meals.push({
                date: new Date(date),
                mealType,
                recipe: recipeId,
                notes
            });

            await mealPlan.save();
            const updatedMealPlan = await MealPlan.findById(id)
                .populate('meals.recipe', 'title prepTime cookTime image')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            res.json(updatedMealPlan);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Remove a meal from a meal plan
    removeMeal: async (req, res) => {
        try {
            const { id, mealId } = req.params;

            const mealPlan = await MealPlan.findById(id);
            if (!mealPlan) {
                return res.status(404).json({ message: 'Meal plan not found' });
            }

            // Verify user has permission
            if (mealPlan.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this meal plan' });
            }

            // Remove meal by id
            mealPlan.meals = mealPlan.meals.filter(meal => meal._id.toString() !== mealId);

            await mealPlan.save();
            const updatedMealPlan = await MealPlan.findById(id)
                .populate('meals.recipe', 'title prepTime cookTime image')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            res.json(updatedMealPlan);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = mealPlanController;
