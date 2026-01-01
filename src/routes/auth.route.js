const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Mapping đúng path theo mô tả API
// Register: POST /user/ (Xem file PDF trang 9 - )
router.post('/', authController.register); // Lưu ý: file server.js sẽ mount vào /it4788/user

// Login: POST /user/login/
router.post('/login', authController.login);

// Logout: POST /user/logout/
router.post('/logout', authController.logout);

// Forgot Password: POST /user/forgot-password/
router.post('/forgot-password', authController.forgotPassword);

// Get User Info: GET /user/
router.get('/', authMiddleware, authController.getMe);

// Edit User Info: POST /user/edit/
router.post('/edit', authMiddleware, authController.editUser);

// Change Password: POST /user/change-password/
router.post('/change-password', authMiddleware, authController.changePassword);

// Send Verification Code: POST /user/send-verification-code/
router.post('/send-verification-code', authController.sendVerificationCode);

// Verify Email: POST /user/verify-email/
router.post('/verify-email', authController.verifyEmail);

// Refresh Token: POST /user/refresh-token/
router.post('/refresh-token', authController.refreshToken);

// Delete Account: DELETE /user/
router.delete('/', authMiddleware, authController.deleteAccount);

module.exports = router;