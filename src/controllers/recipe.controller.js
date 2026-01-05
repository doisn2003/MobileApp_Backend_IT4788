const Recipe = require('../models/Recipe');
const Food = require('../models/food');
const sendResponse = require('../utils/responseHelper');

// Helper to filter by Mode
const getFilterByMode = (mode) => {
    switch (mode) {
        case 'Gymer':
            return {
                'nutrition.kcal': { $gt: 100 },
                'nutrition.protein': { $gt: 18 },
                'nutrition.fat': { $lt: 8 },
                'nutrition.carb': { $gt: 10 }
            };
        case 'Gain Weight':
            return {
                'nutrition.kcal': { $gt: 180 },
                'nutrition.protein': { $gte: 8 },
                'nutrition.fat': { $gte: 8 },
                'nutrition.carb': { $gte: 20 }
            };
        case 'Lose Weight':
            return {
                'nutrition.kcal': { $lte: 120 },
                'nutrition.protein': { $gte: 2 },
                'nutrition.fat': { $lte: 10 }, 
                'nutrition.carb': { $lte: 10 } 
            };
        case 'Vegan':
            return {
                $or: [
                    { tags: 'Vegan' },
                    {
                        'nutrition.protein': { $lt: 3 },
                        'nutrition.fat': { $lt: 3 }
                    }
                ]
            };
        default:
            return {};
    }
};

// 1. Tạo công thức (Create Recipe)
exports.createRecipe = async (req, res) => {
    try {
        let {
            name, htmlContent, description,
            ingredients, nutrition, tags
        } = req.body;
        const file = req.file;

        // Parse JSON strings if coming from FormData
        try {
            if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
            if (typeof nutrition === 'string') nutrition = JSON.parse(nutrition);
            if (typeof tags === 'string') tags = JSON.parse(tags);
        } catch (e) { }

        // Validations
        if (!name) return sendResponse(res, 400, "00358", "Thiếu tên công thức");
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return sendResponse(res, 400, "00358", "Cần có danh sách nguyên liệu");
        }

        if (!req.user.groupId) {
            return sendResponse(res, 400, "00345", "Bạn chưa vào nhóm nào");
        }

        // Image handling
        let imagePath = '';
        if (file) {
            imagePath = file.path.replace(/\\/g, "/");
        }

        // Tạo Recipe
        const newRecipe = new Recipe({
            name,
            htmlContent,
            description,
            ingredients,
            nutrition: nutrition || { kcal: 0, protein: 0, fat: 0, carb: 0 },
            tags: tags || [],
            image: imagePath,
            groupId: req.user.groupId,
            createdBy: req.user._id
        });

        await newRecipe.save();
        return sendResponse(res, 200, "00357", "Thêm công thức nấu ăn thành công", newRecipe);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 2. Lấy danh sách công thức (Get All Recipes with Filter)
exports.getAllRecipes = async (req, res) => {
    try {
        const { mode } = req.query; // 'Gymer', 'Gain Weight', etc.
        const query = { groupId: req.user.groupId };

        if (mode) {
            const modeFilter = getFilterByMode(mode);
            Object.assign(query, modeFilter);
        }

        const recipes = await Recipe.find(query).sort({ createdAt: -1 });
        return sendResponse(res, 200, "00378", "Lấy danh sách công thức thành công", recipes);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 3. Cập nhật công thức
exports.updateRecipe = async (req, res) => {
    try {
        const {
            recipeId, name, htmlContent, description,
            ingredients, nutrition, tags, image
        } = req.body;

        if (!recipeId) return sendResponse(res, 400, "00359", "Thiếu ID công thức");

        const recipe = await Recipe.findOne({ _id: recipeId, groupId: req.user.groupId });
        if (!recipe) return sendResponse(res, 404, "00373", "Không tìm thấy công thức");

        if (name) recipe.name = name;
        if (htmlContent) recipe.htmlContent = htmlContent;
        if (description) recipe.description = description;
        if (ingredients) recipe.ingredients = ingredients;
        if (nutrition) recipe.nutrition = nutrition;
        if (tags) recipe.tags = tags;
        if (image) recipe.image = image;

        await recipe.save();
        return sendResponse(res, 200, "00370", "Cập nhật công thức thành công", recipe);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 4. Xóa công thức
exports.deleteRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;
        if (!recipeId) return sendResponse(res, 400, "00372", "Thiếu ID công thức");

        const recipe = await Recipe.findOneAndDelete({ _id: recipeId, groupId: req.user.groupId });
        if (!recipe) return sendResponse(res, 404, "00373", "Không tìm thấy công thức");

        return sendResponse(res, 200, "00376", "Xóa công thức thành công");

    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};