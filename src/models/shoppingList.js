const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    note: { type: String, default: '' },
    
    // Thuộc nhóm nào
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    
    // Người tạo
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Người được giao việc (Assignee)
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    status: { type: String, default: 'pending', enum: ['pending', 'completed'] }
}, { timestamps: true });

module.exports = mongoose.model('ShoppingList', shoppingListSchema);