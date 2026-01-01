const Recipe = require('../models/Recipe');
const Food = require('../models/food');
const sendResponse = require('../utils/responseHelper');

// 1. Tạo công thức (Create Recipe)
exports.createRecipe = async (req, res) => {
    try {
        const { foodName, name, htmlContent, description } = req.body;

        // Check 00358: Thiếu trường bắt buộc
        if (!foodName || !name || !htmlContent || !description) {
            return sendResponse(res, 400, "00358", "Vui lòng cung cấp tất cả các trường bắt buộc");
        }

        if (!req.user.groupId) {
            return sendResponse(res, 400, "00345", "Bạn chưa vào nhóm nào");
        }

        // --- Tìm Food ID từ Name ---
        const food = await Food.findOne({ name: foodName, groupId: req.user.groupId });

        // Check 00354: Không tìm thấy thực phẩm
        if (!food) {
            return sendResponse(res, 404, "00354", "Không tìm thấy thực phẩm với tên đã cung cấp");
        }

        // Tạo Recipe
        const newRecipe = new Recipe({
            name,
            foodId: food._id,
            htmlContent,
            description,
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

// 2. Lấy công thức theo ID món ăn (Get recipes by food id)
exports.getRecipesByFood = async (req, res) => {
    try {
        [cite_start]// API yêu cầu truyền qua query params: ?foodId=... [cite: 71]
        // Tuy nhiên, logic thực tế thường user bấm vào "Thịt bò" -> App gửi foodId lên
        const { foodId } = req.query;

        if (!foodId) {
            // Nếu không gửi foodId, có thể trả về list rỗng hoặc lỗi tùy logic.
            // Ở đây ta trả về lỗi cho chặt chẽ
            return sendResponse(res, 400, "00022", "Không có ID được cung cấp");
        }

        const recipes = await Recipe.find({ foodId: foodId, groupId: req.user.groupId });

        return sendResponse(res, 200, "00378", "Lấy các công thức thành công", recipes);

    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 3. Cập nhật công thức
exports.updateRecipe = async (req, res) => {
    try {
        const { recipeId, newHtmlContent, newName, newDescription } = req.body;

        if (!recipeId) return sendResponse(res, 400, "00359", "Vui lòng cung cấp một ID công thức.");
        if (!newHtmlContent && !newName && !newDescription) {
            return sendResponse(res, 400, "00360", "Vui lòng cung cấp ít nhất một trong các trường cần sửa.");
        }

        const recipe = await Recipe.findOne({ _id: recipeId, groupId: req.user.groupId });
        if (!recipe) return sendResponse(res, 404, "00373", "Không tìm thấy công thức với ID đã cung cấp");

        if (newHtmlContent) recipe.htmlContent = newHtmlContent;
        if (newName) recipe.name = newName;
        if (newDescription) recipe.description = newDescription;

        await recipe.save();
        return sendResponse(res, 200, "00370", "Cập nhật công thức nấu ăn thành công", recipe);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 4. Xóa công thức
exports.deleteRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;

        if (!recipeId) return sendResponse(res, 400, "00372", "Vui lòng cung cấp một ID công thức hợp lệ.");

        const recipe = await Recipe.findOneAndDelete({ _id: recipeId, groupId: req.user.groupId });
        if (!recipe) return sendResponse(res, 404, "00373", "Không tìm thấy công thức với ID đã cung cấp.");

        return sendResponse(res, 200, "00376", "Công thức của bạn đã được xóa thành công.");

    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};