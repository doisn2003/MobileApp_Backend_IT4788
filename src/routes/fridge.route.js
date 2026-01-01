const express = require('express');
const router = express.Router();
const fridgeController = require('../controllers/fridge.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// POST /fridge/ -> Thêm đồ vào tủ
router.post('/', fridgeController.createFridgeItem);

// GET /fridge/ -> Xem đồ trong tủ
router.get('/', fridgeController.getFridgeItems);

// DELETE /fridge/ -> Xóa đồ (Body: { foodName: '...' })
router.delete('/', fridgeController.deleteFridgeItem);

// PUT /fridge/ -> Cập nhật (Body: { itemId: '...', ... })
router.put('/', fridgeController.updateFridgeItem);

// GET /fridge/:foodName -> Lấy chi tiết
router.get('/:foodName', fridgeController.getFridgeItemDetail);

module.exports = router;