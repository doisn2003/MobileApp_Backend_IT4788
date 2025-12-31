
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, default: 'Nhóm gia đình' }, // Tên mặc định vì API create không gửi tên
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Trưởng nhóm
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Danh sách thành viên
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);