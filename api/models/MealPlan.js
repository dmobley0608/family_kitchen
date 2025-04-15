const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    meals: [
        {
            date: {
                type: Date,
                required: true
            },
            mealType: {
                type: String,
                enum: ['breakfast', 'lunch', 'dinner', 'snack'],
                required: true
            },
            recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe'
            },
            notes: String
        }
    ],
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
