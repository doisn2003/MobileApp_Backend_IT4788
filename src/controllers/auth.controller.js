const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/responseHelper');

// Đăng ký (Register)
exports.register = async (req, res) => {
    try {
        // Lưu ý: Đề bài yêu cầu application/x-www-form-urlencoded
        const { username, email, password, name, language, timezone, deviceId } = req.body;

        // Check 1: Thiếu trường bắt buộc (Mã 00038)
        if (!email || !password || !name || !username) {
            return sendResponse(res, 400, "00038", "Vui lòng cung cấp tất cả các trường bắt buộc!");
        }

        // Check 2: Email tồn tại (Mã 00032)
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return sendResponse(res, 400, "00032", "Một tài khoản với địa chỉ email này đã tồn tại.");
        }

        // Check 3: Username tồn tại (Mã 00084 - phỏng đoán từ bảng lỗi)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return sendResponse(res, 400, "00084", "Đã có một người dùng với tên người dùng này.");
        }

        // Check 4: Validate Password (Mã 00027/00040)
        if (password.length < 6 || password.length > 20) {
            return sendResponse(res, 400, "00040", "Vui lòng cung cấp mật khẩu dài hơn 6 ký tự và ngắn hơn 20 ký tự.");
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo User
        const newUser = new User({
            username, email, password: hashedPassword, name, language, timezone, deviceId
        });
        await newUser.save();

        // Thành công (Mã 00035)
        return sendResponse(res, 201, "00035", "Bạn đã đăng ký thành công.", newUser);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Đã xảy ra lỗi máy chủ nội bộ.");
    }
};

// Đăng nhập (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check thiếu thông tin (Mã 00005)
        if (!email || !password) {
            return sendResponse(res, 400, "00005", "Vui lòng cung cấp đầy đủ thông tin để gửi mã."); // Message gốc của đề hơi lạ, nhưng cứ theo đề
        }

        // Tìm user
        const user = await User.findOne({ email });
        // Check không tìm thấy email (Mã 00042 hoặc 00036)
        if (!user) {
            return sendResponse(res, 404, "00036", "Không tìm thấy tài khoản với địa chỉ email này.");
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Sai pass (Mã 00045)
            return sendResponse(res, 400, "00045", "Bạn đã nhập một email hoặc mật khẩu không hợp lệ.");
        }

        // Tạo Token
        // Check secret
        const secret = process.env.JWT_SECRET || 'default_secret';
        if (!process.env.JWT_SECRET) {
            console.warn("⚠️  WARNING: JWT_SECRET is missing in .env. Using default secret.");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            secret,
            { expiresIn: '30d' }
        );

        // Thành công (Mã 00047)
        const responseData = {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name
            }
        };
        return sendResponse(res, 200, "00047", "Bạn đã đăng nhập thành công.", responseData);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Đã xảy ra lỗi máy chủ nội bộ.");
    }
};

// Quên mật khẩu (Forgot Password)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendResponse(res, 400, "00038", "Vui lòng cung cấp email!");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendResponse(res, 404, "00036", "Không tìm thấy tài khoản với địa chỉ email này.");
        }

        // Trong thực tế sẽ gửi email ở đây.
        // Hiện tại chỉ trả về success để mock
        return sendResponse(res, 200, "00048", "Vui lòng kiểm tra email để lấy lại mật khẩu.");

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Đã xảy ra lỗi máy chủ nội bộ.");
    }
};

// Đăng xuất (Logout)
exports.logout = async (req, res) => {
    try {
        // Vì dùng JWT stateless, server không cần làm gì nhiều trừ khi có blacklist
        return sendResponse(res, 200, "00049", "Đăng xuất thành công.");
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Đã xảy ra lỗi máy chủ nội bộ.");
    }
};