const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Category = require('../models/Category');
const fs = require('fs').promises;
const path = require('path');
const { getImageUrl, deleteImage, processPendingUpload, pendingUploads } = require('../utils/fileUpload');

// Controller methods
const recipeController = {
    // Get all recipes
    getAllRecipes: async (req, res) => {
        try {
            let query;

            // If user is logged in, get public recipes and their household's private recipes
            if (req.user) {
                query = {
                    $or: [
                        { isPrivate: false },
                        { household: req.user.household }
                    ]
                };
            } else {
                // For non-authenticated users, only show public recipes
                query = { isPrivate: false };
            }

            const recipes = await Recipe.find(query)
                .populate('household', 'name')
                .populate('createdBy', 'name')
                .populate('ingredients.ingredient', 'name')
                .populate('category', 'name');

            res.json(recipes);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Get a recipe by ID
    getRecipeById: async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id)
                .populate('household', 'name')
                .populate('createdBy', 'name')
                .populate('ingredients.ingredient', 'name')
                .populate('category', 'name');

            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            res.json(recipe);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Create a new recipe
    createRecipe: async (req, res) => {
        try {
            // Parse JSON strings if they exist (from multipart form data)
            let title = req.body.title;
            let ingredients = req.body.ingredients;
            let instructions = req.body.instructions;
            let isPrivate = req.body.isPrivate;
            let category = req.body.category;
            let prepTime = req.body.prepTime;
            let cookTime = req.body.cookTime;

            // Parse JSON strings if they came from form data
            try {
                if (typeof ingredients === 'string') {
                    ingredients = JSON.parse(ingredients);
                }

                if (typeof isPrivate === 'string') {
                    isPrivate = isPrivate === 'true';
                }
            } catch (error) {
                console.error('Error parsing form data:', error);
                return res.status(400).json({ message: 'Invalid JSON data in form' });
            }

            if (!title || !ingredients || !instructions || !category) {
                return res.status(400).json({ message: 'Please provide title, ingredients, instructions, and category' });
            }

            // Check if user has a household
            if (!req.user.household) {
                return res.status(400).json({ message: 'You need to join a household to create recipes' });
            }

            // Process ingredients - create any that don't exist
            const processedIngredients = await Promise.all(
                ingredients.map(async ({ name, quantity, unit }) => {
                    // Normalize ingredient name (lowercase and trim)
                    const normalizedName = name.toLowerCase().trim();

                    // Find or create the ingredient
                    let ingredient = await Ingredient.findOne({ name: normalizedName });

                    if (!ingredient) {
                        ingredient = await Ingredient.create({ name: normalizedName });
                    }

                    return {
                        ingredient: ingredient._id,
                        quantity,
                        unit
                    };
                })
            );

            // Process category - create it if it doesn't exist
            let categoryObj;
            if (typeof category === 'string') {
                // First, check if the string is a valid MongoDB ObjectId
                const isValidObjectId = mongoose.Types.ObjectId.isValid(category);

                if (isValidObjectId) {
                    // If it's a valid ObjectId, try to find the category by ID
                    categoryObj = await Category.findById(category);

                    // If no category found with this ID, return error
                    if (!categoryObj) {
                        return res.status(404).json({ message: 'Category not found with provided ID' });
                    }
                } else {
                    // Not a valid ObjectId, so treat it as a category name
                    const normalizedCategoryName = category.toLowerCase().trim();
                    categoryObj = await Category.findOne({ name: normalizedCategoryName });

                    if (!categoryObj) {
                        categoryObj = await Category.create({ name: normalizedCategoryName });
                    }
                }
            } else {
                // If it's not a string (e.g., it might be an object with category details)
                return res.status(400).json({ message: 'Invalid category format' });
            }

            // Handle image if uploaded
            let imageData = {};
            if (req.file && req.file.tempData) {
                imageData = {
                    url: req.file.tempData.url,
                    filename: req.file.tempData.filename,
                    mimetype: req.file.tempData.mimetype,
                    size: req.file.tempData.size,
                    status: 'pending'
                };
            }

            // Create the recipe
            const newRecipe = new Recipe({
                title,
                ingredients: processedIngredients,
                instructions,
                category: categoryObj._id,
                isPrivate: isPrivate || false,
                household: req.user.household,
                createdBy: req.user._id,
                prepTime,
                cookTime,
                image: Object.keys(imageData).length > 0 ? imageData : undefined
            });

            const savedRecipe = await newRecipe.save();

            // Process pending upload if exists
            if (req.file && req.file.tempId) {
                // Update the Map with actual recipe ID
                const { tempId } = req.file;
                const fileInfo = pendingUploads.get(tempId);

                if (fileInfo) {
                    pendingUploads.delete(tempId);
                    pendingUploads.set(savedRecipe._id.toString(), fileInfo);

                    // Trigger background processing
                    setTimeout(() => {
                        processPendingUpload(savedRecipe._id.toString())
                            .catch(err => console.error('Background upload failed:', err));
                    }, 100);
                }
            }

            // Populate household, user, ingredient, and category data
            const populatedRecipe = await Recipe.findById(savedRecipe._id)
                .populate('household', 'name')
                .populate('createdBy', 'name')
                .populate('ingredients.ingredient', 'name')
                .populate('category', 'name');

            res.status(201).json(populatedRecipe);
        } catch (error) {
            console.error('Recipe creation error:', error);
            res.status(400).json({ error: error.message });
        }
    },

    // Update a recipe
    updateRecipe: async (req, res) => {
        try {
            const { id } = req.params;

            // Parse JSON strings if they exist (from multipart form data)
            let title = req.body.title;
            let ingredients = req.body.ingredients;
            let instructions = req.body.instructions;
            let isPrivate = req.body.isPrivate;
            let category = req.body.category;
            let prepTime = req.body.prepTime;
            let cookTime = req.body.cookTime;

            // Parse JSON strings if they came from form data
            try {
                if (typeof ingredients === 'string') {
                    ingredients = JSON.parse(ingredients);
                }

                if (typeof isPrivate === 'string') {
                    isPrivate = isPrivate === 'true';
                }
            } catch (error) {
                console.error('Error parsing form data:', error);
                return res.status(400).json({ message: 'Invalid JSON data in form' });
            }

            if (!title || !ingredients || !instructions || !category) {
                return res.status(400).json({ message: 'Please provide title, ingredients, instructions, and category' });
            }

            // Find the existing recipe
            const existingRecipe = await Recipe.findById(id);
            if (!existingRecipe) {
                return res.status(404).json({ error: 'Recipe not found' });
            }

            // Process ingredients - create any that don't exist
            const processedIngredients = await Promise.all(
                ingredients.map(async (item) => {
                    // Handle different formats of ingredient data
                    let name, quantity, unit;

                    if (item.name) {
                        name = item.name;
                        quantity = item.quantity;
                        unit = item.unit;
                    } else if (item.ingredient && typeof item.ingredient === 'object' && item.ingredient.name) {
                        name = item.ingredient.name;
                        quantity = item.quantity;
                        unit = item.unit;
                    } else if (item.ingredient && mongoose.Types.ObjectId.isValid(item.ingredient)) {
                        // If ingredient is already an ObjectId, find it to get the name
                        const ingredientDoc = await Ingredient.findById(item.ingredient);
                        if (ingredientDoc) {
                            return {
                                ingredient: item.ingredient,
                                quantity: item.quantity,
                                unit: item.unit
                            };
                        } else {
                            throw new Error('Ingredient reference not found in database');
                        }
                    } else {
                        throw new Error('Invalid ingredient format');
                    }

                    // Normalize ingredient name (lowercase and trim)
                    const normalizedName = name.toLowerCase().trim();

                    // Find or create the ingredient
                    let ingredient = await Ingredient.findOne({ name: normalizedName });

                    if (!ingredient) {
                        ingredient = await Ingredient.create({ name: normalizedName });
                    }

                    return {
                        ingredient: ingredient._id,
                        quantity,
                        unit
                    };
                })

            );

            // Process category - create it if it doesn't exist
            let categoryObj;
            if (typeof category === 'string') {
                // First, check if the string is a valid MongoDB ObjectId
                const isValidObjectId = mongoose.Types.ObjectId.isValid(category);

                if (isValidObjectId) {
                    // If it's a valid ObjectId, try to find the category by ID
                    categoryObj = await Category.findById(category);

                    // If no category found with this ID, return error
                    if (!categoryObj) {
                        return res.status(404).json({ message: 'Category not found with provided ID' });
                    }
                } else {
                    // Not a valid ObjectId, so treat it as a category name
                    const normalizedCategoryName = category.toLowerCase().trim();
                    categoryObj = await Category.findOne({ name: normalizedCategoryName });

                    if (!categoryObj) {
                        categoryObj = await Category.create({ name: normalizedCategoryName });
                    }
                }
            } else {
                // If it's not a string (e.g., it might be an object with category details)
                return res.status(400).json({ message: 'Invalid category format' });
            }

            // Handle image if uploaded
            let imageData = existingRecipe.image || {};
            if (req.file && req.file.tempData) {
                imageData = {
                    url: req.file.tempData.url,
                    filename: req.file.tempData.filename,
                    mimetype: req.file.tempData.mimetype,
                    size: req.file.tempData.size,
                    status: 'pending'
                };

                // Process pending upload
                if (req.file.tempId) {
                    const { tempId } = req.file;
                    const fileInfo = pendingUploads.get(tempId);

                    if (fileInfo) {
                        pendingUploads.delete(tempId);
                        pendingUploads.set(id, fileInfo);

                        setTimeout(() => {
                            processPendingUpload(id)
                                .catch(err => console.error('Background upload failed:', err));
                        }, 100);
                    }
                }
                  //Delete Old Imgage
                if (existingRecipe.image && existingRecipe.image.filename) {
                    await deleteImage(existingRecipe.image.filename);
                }
            }

            // Update recipe
            const updateData = {
                title,
                ingredients: processedIngredients,
                instructions,
                category: categoryObj._id,
                isPrivate: isPrivate || false,
                prepTime,
                cookTime,
                image: Object.keys(imageData).length > 0 ? imageData : existingRecipe.image
            };

            const updatedRecipe = await Recipe.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).populate('household', 'name')
                .populate('createdBy', 'name')
                .populate('ingredients.ingredient', 'name')
                .populate('category', 'name');

            res.status(200).json(updatedRecipe);
        } catch (error) {
            console.error('Recipe update error:', error);
            res.status(400).json({ error: error.message });
        }
    },

    // Delete a recipe
    deleteRecipe: async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id);

            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            // Delete associated image if it exists
            if (recipe.image && recipe.image.filename) {
                await deleteImage(recipe.image.filename);
            }

            await Recipe.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: 'Recipe deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Upload recipe image
    uploadRecipeImage: async (req, res) => {
        try {
            if (!req.file || !req.file.galleryData) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Return complete gallery image info
            const imageData = {
                id: req.file.galleryData.id,
                filename: req.file.galleryData.filename,
                url: req.file.galleryData.url,
                mimetype: req.file.galleryData.mimetype,
                size: req.file.galleryData.size
            };

            res.status(200).json(imageData);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

module.exports = recipeController;
