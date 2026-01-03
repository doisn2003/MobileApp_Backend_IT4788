const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
    // Ngày lên lịch (Lưu dạng Date để dễ query)
    date: { type: Date, required: true },

    // Buổi: Sáng, Trưa, Tối
    session: {
        type: String,
        required: true,
        enum: ['sáng', 'trưa', 'tối', 'Sáng', 'Trưa', 'Tối'] // Chấp nhận cả hoa thường cho tiện
    },

    // Món ăn (Fridge Item)
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: false },

    // Công thức (Recipe)
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: false },

    // Chế độ ăn (Mode) - Optional (Gymer, Vegan, etc.)
    mode: { type: String, required: false },

    // Thuộc nhóm nào
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);