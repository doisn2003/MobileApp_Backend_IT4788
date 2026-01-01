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
    
    // Món ăn
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    
    // Thuộc nhóm nào
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);