const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, default: '' }, // Đường dẫn ảnh
    
    // Liên kết
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    
    // Người tạo (Optional - để tracking)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);