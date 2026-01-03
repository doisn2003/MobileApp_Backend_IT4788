const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

const upload = require('../middlewares/uploadMiddleware');

// POST /recipe/ -> Tạo công thức
router.post('/', upload.single('image'), recipeController.createRecipe);

// GET /recipe/ -> Lấy danh sách công thức (Query: ?mode=Gymer...)
router.get('/', recipeController.getAllRecipes);

// DELETE /recipe/ -> Xóa công thức
router.delete('/', recipeController.deleteRecipe);

// PUT /recipe/ -> Cập nhật công thức
router.put('/', recipeController.updateRecipe);

module.exports = router;