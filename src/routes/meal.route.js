const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// POST /meal/ -> Tạo kế hoạch
router.post('/', mealController.createMealPlan);

// GET /meal/ -> Lấy kế hoạch (Query: ?date=YYYY-MM-DD)
router.get('/', mealController.getMealPlanByDate);

// DELETE /meal/ -> Xóa kế hoạch
router.delete('/', mealController.deleteMealPlan);

module.exports = router;