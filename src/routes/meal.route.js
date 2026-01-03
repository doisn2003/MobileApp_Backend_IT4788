const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// POST /meal/ -> Tạo kế hoạch
router.post('/', mealController.createMealPlan);

// GET /meal/dates -> Lấy danh sách ngày có bữa ăn
router.get('/dates', mealController.getMealDates);

// GET /meal/ -> Lấy kế hoạch (Query: ?date=YYYY-MM-DD)
router.get('/', mealController.getMealPlanByDate);

// DELETE /meal/ -> Xóa kế hoạch
router.delete('/', mealController.deleteMealPlan);

// PUT /meal/ -> Cập nhật
router.put('/', mealController.updateMealPlan);

module.exports = router;