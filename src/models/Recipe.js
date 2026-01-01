const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Tên công thức (VD: Bò kho ngũ vị)
    
    // Món ăn chính liên quan (VD: Thịt bò)
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    
    // Nội dung hướng dẫn (lưu dạng HTML string)
    htmlContent: { type: String, required: true },
    
    description: { type: String, default: '' }, // Mô tả ngắn
    
    // Thuộc nhóm nào (Công thức của gia đình)
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);