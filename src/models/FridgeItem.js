const mongoose = require('mongoose');

const fridgeItemSchema = new mongoose.Schema({
    // Liên kết với bảng Food
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },

    // Thuộc nhóm nào
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },

    // Thông tin cụ thể trong tủ
    quantity: { type: String, required: true }, // Ví dụ: "2kg", "3 quả"
    useWithin: { type: String, required: true }, // Hạn sử dụng (Date string)
    note: { type: String, default: '' },
    compartment: {
        type: String,
        enum: ['Freezer', 'Cooler'],
        default: 'Cooler',
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('FridgeItem', fridgeItemSchema);