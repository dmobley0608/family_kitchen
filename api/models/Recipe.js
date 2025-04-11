const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    prepTime: {
        type: Number,
        required: true,
        min: 0
    },
    cookTime: {
        type: Number,
        required: true,
        min: 0
    },
    ingredients: [
        {
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ingredient',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                required: true,
                enum: ['tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'pinch', 'whole', 'slice', 'clove']
            }
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
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
    dateCreated: {
        type: Date,
        default: Date.now
    },
    image: {
        url: String,
        id: String,
        filename: String,
        mimetype: String,
        size: Number,
        status: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Recipe', RecipeSchema);
