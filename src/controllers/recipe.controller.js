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