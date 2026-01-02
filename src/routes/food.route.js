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

// GET /food/categories
router.get('/categories', foodController.getAllCategories);

// GET /food/units
router.get('/units', foodController.getAllUnits);

// PUT /food/ -> Cập nhật (có thể có ảnh)
router.put('/', upload.single('image'), foodController.updateFood);

// DELETE /food/ -> Xóa
router.delete('/', foodController.deleteFood);

module.exports = router;