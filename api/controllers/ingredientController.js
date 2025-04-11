const Ingredient = require('../models/Ingredient');

const ingredientController = {
    // Get all ingredients
    getAllIngredients: async (req, res) => {
        try {
            const ingredients = await Ingredient.find().sort('name');
            res.json(ingredients);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Get ingredient by ID
    getIngredientById: async (req, res) => {
        try {
            const ingredient = await Ingredient.findById(req.params.id);

            if (!ingredient) {
                return res.status(404).json({ message: 'Ingredient not found' });
            }

            res.json(ingredient);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Create a new ingredient
    createIngredient: async (req, res) => {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: 'Please provide ingredient name' });
            }

            // Check if ingredient already exists (case-insensitive)
            const normalizedName = name.toLowerCase().trim();
            const existingIngredient = await Ingredient.findOne({ name: normalizedName });

            if (existingIngredient) {
                return res.status(400).json({
                    message: 'This ingredient already exists',
                    ingredient: existingIngredient
                });
            }

            const ingredient = await Ingredient.create({ name: normalizedName });
            res.status(201).json(ingredient);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

module.exports = ingredientController;
