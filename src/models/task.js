const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // Thuộc danh sách nào
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingList', required: true },
    
    // Món gì (Liên kết với Food để lấy ảnh)
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    
    quantity: { type: String, required: true },
    status: { type: Boolean, default: false } // false: chưa mua, true: đã mua
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);