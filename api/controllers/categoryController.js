const Category = require('../models/Category');

const categoryController = {
    // Get all categories
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find().sort('name');
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Get category by ID
    getCategoryById: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);

            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.json(category);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Create a new category
    createCategory: async (req, res) => {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({ message: 'Please provide category name' });
            }

            // Check if category already exists (case-insensitive)
            const normalizedName = name.toLowerCase().trim();
            const existingCategory = await Category.findOne({ name: normalizedName });

            if (existingCategory) {
                return res.status(400).json({
                    message: 'This category already exists',
                    category: existingCategory
                });
            }

            const category = await Category.create({
                name: normalizedName,
                description: description || ''
            });

            res.status(201).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

module.exports = categoryController;
