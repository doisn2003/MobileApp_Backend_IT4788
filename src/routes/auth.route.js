const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Mapping đúng path theo mô tả API
// Register: POST /user/ (Xem file PDF trang 9 - )
router.post('/', authController.register); // Lưu ý: file server.js sẽ mount vào /it4788/user

// Login: POST /user/login/
router.post('/login', authController.login);

module.exports = router;