const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true } // Lưu trong DB thống nhất là name cho dễ
}, { timestamps: true });

module.exports = mongoose.model('Unit', unitSchema);