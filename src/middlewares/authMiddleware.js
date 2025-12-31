const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/responseHelper');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    // 1. Lấy token từ header (Format: "Bearer <token>")
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check lỗi 00006: Không có token
    if (!token) {
        return sendResponse(res, 401, "00006", "Truy cập bị từ chối. Không có token được cung cấp.");
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Tìm user từ token và gán vào req để các bước sau dùng
        const user = await User.findById(decoded.id).select('-password'); // Bỏ qua field password
        
        if (!user) {
             return sendResponse(res, 401, "00007", "ID người dùng không hợp lệ.");
        }

        req.user = user;
        next(); // Cho phép đi tiếp
    } catch (error) {
        // Check lỗi 00012: Token sai hoặc hết hạn
        return sendResponse(res, 401, "00012", "Token không hợp lệ. Token có thể đã hết hạn.");
    }
};

module.exports = authMiddleware;