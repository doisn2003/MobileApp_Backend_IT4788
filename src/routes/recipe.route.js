const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// POST /recipe/ -> Tạo công thức
router.post('/', recipeController.createRecipe);

// GET /recipe/ -> Lấy công thức (Query: ?foodId=...)
router.get('/', recipeController.getRecipesByFood);

// DELETE /recipe/ -> Xóa công thức
router.delete('/', recipeController.deleteRecipe);

// PUT /recipe/ -> Cập nhật công thức
router.put('/', recipeController.updateRecipe);

module.exports = router;