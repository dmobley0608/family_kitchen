const ShoppingList = require('../models/ShoppingList');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const MealPlan = require('../models/MealPlan');

const shoppingListController = {
    // Get all shopping lists for user's household
    getShoppingLists: async (req, res) => {
        try {
            const shoppingLists = await ShoppingList.find({
                household: req.user.household,
                isActive: true
            })
                .sort({ createdAt: -1 });

            res.json(shoppingLists);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Get shopping list by ID
    getShoppingListById: async (req, res) => {
        try {
            const { id } = req.params;
            const shoppingList = await ShoppingList.findById(id)
                .populate('items.ingredient', 'name')
                .populate('recipes', 'title')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            if (!shoppingList) {
                return res.status(404).json({ message: 'Shopping list not found' });
            }

            res.json(shoppingList);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Create a new shopping list
    createShoppingList: async (req, res) => {
        try {
            const { name, recipeIds } = req.body;

            const newShoppingList = new ShoppingList({
                household: req.user.household,
                createdBy: req.user._id,
                name,
                items: [],
                recipes: recipeIds || []
            });

            // If recipes are provided, add their ingredients to the list
            if (recipeIds && recipeIds.length > 0) {
                const recipes = await Recipe.find({ _id: { $in: recipeIds } })
                    .populate('ingredients.ingredient', 'name');

                const ingredientMap = new Map();

                // Process each recipe's ingredients
                recipes.forEach(recipe => {
                    recipe.ingredients.forEach(ing => {
                        const key = ing.ingredient._id.toString();
                        if (ingredientMap.has(key)) {
                            // Add quantities if ingredient already exists
                            const item = ingredientMap.get(key);
                            // Only add quantities if units match
                            if (item.unit === ing.unit) {
                                item.quantity += ing.quantity;
                            } else {
                                // If units don't match, add as separate item
                                newShoppingList.items.push({
                                    ingredient: ing.ingredient._id,
                                    quantity: ing.quantity,
                                    unit: ing.unit,
                                    recipe: recipe._id
                                });
                            }
                        } else {
                            // Add new ingredient to map
                            ingredientMap.set(key, {
                                ingredient: ing.ingredient._id,
                                quantity: ing.quantity,
                                unit: ing.unit,
                                recipe: recipe._id
                            });
                        }
                    });
                });

                // Add consolidated ingredients from map to shopping list
                ingredientMap.forEach(item => {
                    newShoppingList.items.push(item);
                });
            }

            const savedShoppingList = await newShoppingList.save();
            const populatedList = await ShoppingList.findById(savedShoppingList._id)
                .populate('items.ingredient', 'name')
                .populate('recipes', 'title')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            res.status(201).json(populatedList);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update a shopping list
    updateShoppingList: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, items, isActive } = req.body;

            const shoppingList = await ShoppingList.findById(id);
            if (!shoppingList) {
                return res.status(404).json({ message: 'Shopping list not found' });
            }

            // Verify user has permission
            if (shoppingList.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this shopping list' });
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (items !== undefined) updateData.items = items;
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedList = await ShoppingList.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).populate('items.ingredient', 'name')
                .populate('recipes', 'title')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            res.json(updatedList);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete a shopping list
    deleteShoppingList: async (req, res) => {
        try {
            const { id } = req.params;
            const shoppingList = await ShoppingList.findById(id);

            if (!shoppingList) {
                return res.status(404).json({ message: 'Shopping list not found' });
            }

            // Verify user has permission
            if (shoppingList.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete this shopping list' });
            }

            // Soft delete by setting isActive to false
            shoppingList.isActive = false;
            await shoppingList.save();

            res.json({ message: 'Shopping list deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    // Add item to shopping list
    addItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { ingredientId, name, quantity, unit } = req.body;

            const shoppingList = await ShoppingList.findById(id);
            if (!shoppingList) {
                return res.status(404).json({ message: 'Shopping list not found' });
            }

            // Verify user has permission
            if (shoppingList.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this shopping list' });
            }

            // Create new item
            const newItem = {
                quantity,
                unit,
                addedManually: true
            };

            // Handle ingredient ID or custom name
            if (ingredientId) {
                newItem.ingredient = ingredientId;
            } else if (name) {
                // Check if ingredient exists by name
                const normalizedName = name.toLowerCase().trim();
                let ingredient = await Ingredient.findOne({ name: normalizedName });

                // Create new ingredient if it doesn't exist
                if (!ingredient) {
                    ingredient = await Ingredient.create({ name: normalizedName });
                }

                newItem.ingredient = ingredient._id;
            } else {
                return res.status(400).json({ message: 'Item must have either ingredient ID or name' });
            }

            // Add item to list
            shoppingList.items.push(newItem);
            await shoppingList.save();

            const updatedList = await ShoppingList.findById(id)
                .populate('items.ingredient', 'name')
                .populate('recipes', 'title');

            res.json(updatedList);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Remove item from shopping list
    removeItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;

            const shoppingList = await ShoppingList.findById(id);
            if (!shoppingList) {
                return res.status(404).json({ message: 'Shopping list not found' });
            }

            // Verify user has permission
            if (shoppingList.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this shopping list' });
            }

            // Remove item by id
            shoppingList.items = shoppingList.items.filter(item => item._id.toString() !== itemId);
            await shoppingList.save();

            const updatedList = await ShoppingList.findById(id)
                .populate('items.ingredient', 'name')
                .populate('recipes', 'title');

            res.json(updatedList);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Toggle item purchased status
    toggleItemPurchased: async (req, res) => {
        try {
            const { id, itemId } = req.params;

            const shoppingList = await ShoppingList.findById(id);
            if (!shoppingList) {
                return res.status(404).json({ message: 'Shopping list not found' });
            }

            // Verify user has permission
            if (shoppingList.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this meal plan' });
            }

            // Find and update the item
            const item = shoppingList.items.id(itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found in shopping list' });
            }

            item.purchased = !item.purchased;
            await shoppingList.save();

            const updatedList = await ShoppingList.findById(id)
                .populate('items.ingredient', 'name')
                .populate('recipes', 'title');

            res.json(updatedList);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Generate shopping list from meal plan
    generateFromMealPlan: async (req, res) => {
        try {
            const { mealPlanId, name } = req.body;

            // Find meal plan
            const mealPlan = await MealPlan.findById(mealPlanId)
                .populate('meals.recipe');

            if (!mealPlan) {
                return res.status(404).json({ message: 'Meal plan not found' });
            }

            // Verify user has permission
            if (mealPlan.household.toString() !== req.user.household._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this meal plan' });
            }

            // Generate list name based on meal plan if not provided
            const listName = name || `Shopping List for ${new Date(mealPlan.startDate).toLocaleDateString()}`;

            // Check if shopping list for this meal plan already exists
            const existingList = await ShoppingList.findOne({
                household: req.user.household,
                name: listName,
                isActive: true
            });

            let shoppingList;

            if (existingList) {
                // Use the existing shopping list
                shoppingList = existingList;
                console.log(`Updating existing shopping list: ${existingList._id}`);
            } else {
                // Create new shopping list
                shoppingList = new ShoppingList({
                    household: req.user.household,
                    createdBy: req.user._id,
                    name: listName,
                    items: [],
                    recipes: []
                });
                console.log('Creating new shopping list');
            }

            // Extract recipes from meal plan (keeping all instances for quantity calculation)
            const mealRecipes = mealPlan.meals
                .filter(meal => meal.recipe)
                .map(meal => meal.recipe);

            // Count recipe occurrences for multiplying ingredients
            const recipeCountMap = new Map();
            mealRecipes.forEach(recipe => {
                const recipeId = recipe._id.toString();
                recipeCountMap.set(recipeId, (recipeCountMap.get(recipeId) || 0) + 1);
            });

            // Add unique recipe IDs to the shopping list (avoid duplicates)
            const uniqueRecipeIds = [...new Set(mealRecipes.map(recipe => recipe._id.toString()))];

            // Add new recipes to the existing recipes array (avoiding duplicates)
            if (existingList) {
                const existingRecipeIds = shoppingList.recipes.map(id => id.toString());
                uniqueRecipeIds.forEach(recipeId => {
                    if (!existingRecipeIds.includes(recipeId)) {
                        shoppingList.recipes.push(recipeId);
                    }
                });
            } else {
                shoppingList.recipes = uniqueRecipeIds;
            }

            // Get full recipe details for all recipes
            const recipes = await Recipe.find({ _id: { $in: uniqueRecipeIds } })
                .populate('ingredients.ingredient', 'name');

            // Create a map of existing ingredients in the shopping list (if it exists)
            const existingIngredientMap = new Map();
            if (existingList) {
                shoppingList.items.forEach(item => {
                    const key = `${item.ingredient.toString()}-${item.unit}`;
                    existingIngredientMap.set(key, item);
                });
            }

            // Consolidate ingredients across recipes
            const ingredientMap = new Map();

            recipes.forEach(recipe => {
                // Get how many times this recipe appears in the meal plan
                const recipeCount = recipeCountMap.get(recipe._id.toString()) || 1;

                recipe.ingredients.forEach(ing => {
                    const key = `${ing.ingredient._id.toString()}-${ing.unit}`;
                    // Multiply ingredient quantity by the number of times the recipe appears
                    const adjustedQuantity = ing.quantity * recipeCount;

                    if (ingredientMap.has(key)) {
                        // Add quantities if ingredient with same unit already exists
                        const item = ingredientMap.get(key);
                        item.quantity += adjustedQuantity;
                    } else {
                        // Add new ingredient to map
                        ingredientMap.set(key, {
                            ingredient: ing.ingredient._id,
                            quantity: adjustedQuantity,
                            unit: ing.unit,
                            recipe: recipe._id
                        });
                    }
                });
            });

            // Update quantities for existing ingredients or add new ingredients
            if (existingList) {
                ingredientMap.forEach((item, key) => {
                    if (existingIngredientMap.has(key)) {
                        // Update quantity for existing ingredient
                        const existingItem = existingIngredientMap.get(key);
                        existingItem.quantity += item.quantity;
                    } else {
                        // Add new ingredient to the list
                        shoppingList.items.push(item);
                    }
                });
            } else {
                // Add all consolidated ingredients to new shopping list
                ingredientMap.forEach(item => {
                    shoppingList.items.push(item);
                });
            }

            const savedList = await shoppingList.save();
            const populatedList = await ShoppingList.findById(savedList._id)
                .populate('items.ingredient', 'name')
                .populate('recipes', 'title')
                .populate('household', 'name')
                .populate('createdBy', 'name');

            res.status(existingList ? 200 : 201).json(populatedList);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = shoppingListController;
