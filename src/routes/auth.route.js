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

module.exports = router;