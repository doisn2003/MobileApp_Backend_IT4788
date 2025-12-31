const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Cần thiết dù bảng API Register thiếu
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] }, // Mặc định là user
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    avatar: { type: String, default: '' },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    // Các trường đề bài yêu cầu thêm
    language: { type: String, default: 'vi' },
    timezone: { type: String, default: 'GMT+7' },
    deviceId: { type: String, default: '' }
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);