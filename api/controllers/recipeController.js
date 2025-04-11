const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Category = require('../models/Category');
const fs = require('fs').promises;
const path = require('path');
const { cloudinary, useCloudinary } = require('../utils/fileUpload');

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
            // Clean up the uploaded file if validation fails
            if (req.file && !useCloudinary) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            }
            return res.status(400).json({ message: 'Please provide title, ingredients, instructions, and category' });
        }

        try {
            // Check if user has a household
            if (!req.user.household) {
                // Clean up the uploaded file if user doesn't have a household
                if (req.file && !useCloudinary) {
                    try {
                        await fs.unlink(req.file.path);
                    } catch (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr);
                    }
                }
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

            // Prepare image data if file was uploaded
            let imageData = {};
            if (req.file) {
                if (useCloudinary) {
                    // The file is already uploaded to Cloudinary by the CloudinaryStorage
                    imageData = {
                        url: req.file.path, // CloudinaryStorage puts the URL in path
                        publicId: req.file.filename, // CloudinaryStorage puts the public ID in filename
                    };
                } else {
                    // For local storage, store the relative path
                    const relativePath = `/uploads/${path.basename(req.file.path)}`;
                    imageData = {
                        url: relativePath,
                        localPath: req.file.path
                    };
                }
            }

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

            // Populate household, user, ingredient, and category data
            const populatedRecipe = await Recipe.findById(savedRecipe._id)
                .populate('household', 'name')
                .populate('createdBy', 'name')
                .populate('ingredients.ingredient', 'name')
                .populate('category', 'name');

            res.status(201).json(populatedRecipe);
        } catch (error) {
            // Clean up the uploaded file if there's an error
            if (req.file && !useCloudinary) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            }
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Update a recipe
    updateRecipe: async (req, res) => {
        try {
            // Parse JSON strings if they exist (from multipart form data)
            let ingredients = req.body.ingredients;
            let category = req.body.category;

            // Parse any JSON strings that came from form data
            if (typeof ingredients === 'string') {
                try {
                    ingredients = JSON.parse(ingredients);
                } catch (e) {
                    console.error('Error parsing ingredients JSON:', e);
                    return res.status(400).json({ message: 'Invalid ingredients format' });
                }
            }

            const otherFields = { ...req.body };
            delete otherFields.ingredients;
            delete otherFields.category;

            let updateData = { ...otherFields };

            // If ingredients are being updated
            if (ingredients) {
                // Process ingredients - create any that don't exist
                const processedIngredients = await Promise.all(
                    ingredients.map(async ({ name, quantity, unit }) => {
                        // Handle both name string and ingredient ID
                        let ingredient;

                        if (typeof name === 'string') {
                            const normalizedName = name.toLowerCase().trim();
                            ingredient = await Ingredient.findOne({ name: normalizedName });

                            if (!ingredient) {
                                ingredient = await Ingredient.create({ name: normalizedName });
                            }
                        } else {
                            // If an ID is provided instead of a name
                            ingredient = await Ingredient.findById(name);
                            if (!ingredient) {
                                throw new Error(`Ingredient with ID ${name} not found`);
                            }
                        }

                        return {
                            ingredient: ingredient._id,
                            quantity,
                            unit
                        };
                    })
                );

                updateData.ingredients = processedIngredients;
            }

            // If category is being updated
            if (category) {
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

                updateData.category = categoryObj._id;
            }

            // Handle image update if there's a new image
            if (req.file) {
                const recipe = await Recipe.findById(req.params.id);

                // Delete old image if it exists
                if (recipe.image) {
                    if (recipe.image.publicId && useCloudinary) {
                        await cloudinary.uploader.destroy(recipe.image.publicId);
                    } else if (recipe.image.localPath) {
                        try {
                            await fs.unlink(recipe.image.localPath);
                        } catch (err) {
                            console.error('Error deleting old image:', err);
                        }
                    }
                }

                // Update with new image
                if (useCloudinary) {
                    updateData.image = {
                        url: req.file.path,
                        publicId: req.file.filename
                    };
                } else {
                    const relativePath = `/uploads/${path.basename(req.file.path)}`;
                    updateData.image = {
                        url: relativePath,
                        localPath: req.file.path
                    };
                }
            } else if (req.body.removeImage === 'true') {
                // Handle explicit image removal
                const recipe = await Recipe.findById(req.params.id);

                // Delete the image file if it exists
                if (recipe.image) {
                    if (recipe.image.publicId && useCloudinary) {
                        await cloudinary.uploader.destroy(recipe.image.publicId);
                    } else if (recipe.image.localPath) {
                        try {
                            await fs.unlink(recipe.image.localPath);
                        } catch (err) {
                            console.error('Error deleting image file:', err);
                        }
                    }
                }

                // Set image field to null/undefined
                updateData.image = null;
            }

            const updatedRecipe = await Recipe.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).populate('household', 'name')
                .populate('createdBy', 'name')
                .populate('ingredients.ingredient', 'name')
                .populate('category', 'name');

            if (!updatedRecipe) {
                // Clean up uploaded file if recipe not found
                if (req.file && !useCloudinary) {
                    try {
                        await fs.unlink(req.file.path);
                    } catch (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr);
                    }
                }
                return res.status(404).json({ message: 'Recipe not found' });
            }

            res.json(updatedRecipe);
        } catch (error) {
            // Clean up uploaded file if error occurs
            if (req.file && !useCloudinary) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            }
            res.status(500).json({ message: 'Server Error', error: error.message });
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
            if (recipe.image) {
                if (recipe.image.publicId && useCloudinary) {
                    await cloudinary.uploader.destroy(recipe.image.publicId);
                } else if (recipe.image.localPath) {
                    try {
                        await fs.unlink(recipe.image.localPath);
                    } catch (err) {
                        console.error('Error deleting image file:', err);
                    }
                }
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
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            let imageData = {};
            if (useCloudinary) {
                imageData = {
                    url: req.file.path,
                    publicId: req.file.filename
                };
            } else {
                const relativePath = `/uploads/${path.basename(req.file.path)}`;
                imageData = {
                    url: relativePath,
                    localPath: req.file.path
                };
            }

            res.status(200).json(imageData);
        } catch (error) {
            // Clean up the uploaded file if there's an error
            if (req.file && !useCloudinary) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            }
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

module.exports = recipeController;
