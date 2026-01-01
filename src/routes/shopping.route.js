const express = require('express');
const router = express.Router();
const shoppingController = require('../controllers/shopping.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// 1. Shopping List
router.post('/', shoppingController.createShoppingList); // Tạo list
router.get('/', shoppingController.getShoppingLists);    // Lấy tất cả list của nhóm
router.put('/', shoppingController.updateShoppingList); // Cập nhật list
router.delete('/', shoppingController.deleteShoppingList); // Xóa list

// 2. Task (Lưu ý đường dẫn có /task/)
// POST /shopping/task/ -> Tạo task (Dùng JSON body)
router.post('/task', shoppingController.createTasks);

// GET /shopping/task/ -> Lấy tasks (kèm ?listId=...)
router.get('/task', shoppingController.getTasksByList);

// PUT /shopping/task/ -> Cập nhật task
router.put('/task', shoppingController.updateTask);

// DELETE /shopping/task/ -> Xóa task
router.delete('/task', shoppingController.deleteTask);

module.exports = router;