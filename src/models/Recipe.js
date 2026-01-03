const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },

    // Ingredients List
    ingredients: [{
        name: { type: String, required: true }, // Tên nguyên liệu (sẽ map với Food trong tủ lạnh)
        quantity: { type: Number, required: true },
        unit: { type: String, required: false }
    }],

    // Nutrition Info per 100g
    nutrition: {
        kcal: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        carb: { type: Number, default: 0 }
    },

    htmlContent: { type: String, required: false }, // Hướng dẫn chi tiết
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    tags: [{ type: String }], // 'Vegan', 'Gymer', etc.

    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);





