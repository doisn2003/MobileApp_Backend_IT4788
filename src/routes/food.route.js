const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

// POST /food/ -> Tạo thực phẩm (có upload ảnh)
// 'image' là tên key trong form-data
router.post('/', upload.single('image'), foodController.createFood);

// GET /food/ -> Lấy danh sách
router.get('/', foodController.getFoods);

module.exports = router;