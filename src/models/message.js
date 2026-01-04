const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'text' }, // text, image, etc.
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
