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

// Lấy thông tin user (Get Me)
exports.getMe = async (req, res) => {
    try {
        // req.user đã được populate từ authMiddleware
        const user = req.user;
        return sendResponse(res, 200, "00047", "Lấy thông tin thành công", user);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// Chỉnh sửa thông tin user (Edit User)
exports.editUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, name, language, timezone, deviceId, avatar } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (name) updateData.name = name;
        if (language) updateData.language = language;
        if (timezone) updateData.timezone = timezone;
        if (deviceId) updateData.deviceId = deviceId;
        if (avatar) updateData.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        return sendResponse(res, 200, "00047", "Cập nhật thông tin thành công", updatedUser);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!oldPassword || !newPassword || oldPassword.length < 6 || newPassword.length < 6 || oldPassword.length > 20 || newPassword.length > 20) {
            return sendResponse(res, 400, "00069", "Vui lòng cung cấp mật khẩu cũ và mới dài hơn 6 ký tự và ngắn hơn 20 ký tự.");
        }

        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return sendResponse(res, 400, "00072", "Mật khẩu cũ của bạn không khớp với mật khẩu bạn nhập.");
        }

        if (oldPassword === newPassword) {
            return sendResponse(res, 400, "00073", "Mật khẩu mới của bạn không nên giống với mật khẩu cũ.");
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return sendResponse(res, 200, "00076", "Mật khẩu của bạn đã được thay đổi thành công.");
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// Gửi mã xác thực (Mock)
exports.sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return sendResponse(res, 400, "00005", "Vui lòng cung cấp đầy đủ thông tin để gửi mã.");
        }
        // Logic gửi email thật sẽ ở đây
        return sendResponse(res, 200, "00048", "Mã đã được gửi đến email của bạn thành công.");
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// Xác thực email (Mock)
exports.verifyEmail = async (req, res) => {
    try {
        const { code, token } = req.body;
        if (!code && !token) {
            return sendResponse(res, 400, "00053", "Vui lòng gửi một mã xác nhận.");
        }
        // Mock check
        if (code === "123456") {
            return sendResponse(res, 200, "00058", "Địa chỉ email của bạn đã được xác minh thành công.");
        } else {
            return sendResponse(res, 400, "00054", "Mã bạn nhập không khớp với mã chúng tôi đã gửi.");
        }
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// Refresh Token (Mock)
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return sendResponse(res, 400, "00059", "Vui lòng cung cấp token làm mới.");
        }
        // Logic check refresh token DB
        return sendResponse(res, 200, "00065", "Token đã được làm mới thành công.");
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// Xóa tài khoản
exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        return sendResponse(res, 200, "00092", "Tài khoản của bạn đã bị xóa thành công.");
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// API gửi token thiết bị mỗi khi user đăng nhập
exports.registerDeviceToken = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ middleware xác thực (JWT)
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ message: "Token is required" });
        }

        // Dùng $addToSet của MongoDB để tránh trùng lặp token
        await User.findByIdAndUpdate(userId, {
            $addToSet: { fcmTokens: fcmToken }
        });

        return res.status(200).json({ message: "Device token registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};