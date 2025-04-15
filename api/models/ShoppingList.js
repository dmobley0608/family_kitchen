const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
    household: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    items: [
        {
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ingredient'
            },
            name: String, // For custom items not in the ingredient database
            quantity: Number,
            unit: String,
            purchased: {
                type: Boolean,
                default: false
            },
            recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe'
            }, // Optional recipe reference
            addedManually: {
                type: Boolean,
                default: false
            }
        }
    ],
    recipes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe'
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
