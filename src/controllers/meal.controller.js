const MealPlan = require('../models/mealPlan');
const Food = require('../models/food');
const sendResponse = require('../utils/responseHelper');

// 1. Tạo kế hoạch bữa ăn (Create Meal Plan)
// 1. Tạo kế hoạch bữa ăn (Create Meal Plan)
exports.createMealPlan = async (req, res) => {
    try {
        // Body: { foodName, timestamp, name, recipeId, mode } 
        // 'name' là buổi (sáng/trưa/tối)
        const { foodName, timestamp, name, recipeId, mode } = req.body;

        // Check 00323: Thiếu trường basics
        if (!timestamp || !name) {
            return sendResponse(res, 400, "00323", "Vui lòng cung cấp ngày và buổi");
        }

        // Validate inputs: Must have either foodName (Fridge) or recipeId (Recipe)
        if (!foodName && !recipeId) {
            return sendResponse(res, 400, "00323", "Vui lòng chọn món ăn hoặc công thức");
        }

        if (!req.user.groupId) {
            return sendResponse(res, 400, "00319", "Người dùng không phải là quản trị viên nhóm");
        }

        // Check 00336: Validate buổi
        const validSessions = ['sáng', 'trưa', 'tối'];
        if (!validSessions.includes(name.toLowerCase())) {
            return sendResponse(res, 400, "00336", "Vui lòng cung cấp một tên hợp lệ, sáng, trưa, tối");
        }

        let foodId = null;

        // Logic 1: Add from Fridge (foodName)
        if (foodName && !recipeId) {
            const food = await Food.findOne({ name: foodName, groupId: req.user.groupId });
            if (!food) {
                return sendResponse(res, 404, "00317", "Không tìm thấy thực phẩm trong tủ lạnh");
            }
            foodId = food._id;
        }

        // Tạo Meal Plan
        const newPlan = new MealPlan({
            date: new Date(timestamp),
            session: name,
            foodId: foodId,      // Optional
            recipeId: recipeId,  // Optional
            mode: mode,          // Optional (Gymer, Vegan, etc.)
            groupId: req.user.groupId,
            createdBy: req.user._id
        });

        await newPlan.save();
        return sendResponse(res, 200, "00322", "Thêm kế hoạch bữa ăn thành công", newPlan);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 2. Lấy kế hoạch theo ngày (Get meal plan by date)
exports.getMealPlanByDate = async (req, res) => {
    try {
        const { date, mode } = req.query;

        if (!date) {
            return sendResponse(res, 400, "00331", "Vui lòng cung cấp ngày");
        }

        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const filter = {
            groupId: req.user.groupId,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        };

        // Filter by Mode
        if (mode) {
            // If mode is specified, return plans FOR that mode
            filter.mode = mode;
        } else {
            // If mode is NOT specified (Family Tab), return plans WITHOUT mode
            // This ensures strict separation
            filter.mode = { $in: [null, undefined, ""] };
        }

        const plans = await MealPlan.find(filter)
            .populate('foodId', 'name image unitId categoryId') // Populate Fridge Item
            .populate('recipeId', 'name image nutrition ingredients htmlContent') // Populate Recipe Item
            .sort({ session: 1 });

        return sendResponse(res, 200, "00348", "Lấy danh sách thành công", plans);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 3. Xóa kế hoạch (Delete plan)
exports.deleteMealPlan = async (req, res) => {
    try {
        const { planId } = req.body; // Body: { planId: "..." }

        if (!planId) return sendResponse(res, 400, "00332", "Vui lòng cung cấp ID kế hoạch");

        const deleted = await MealPlan.findOneAndDelete({ _id: planId, groupId: req.user.groupId });

        if (!deleted) return sendResponse(res, 404, "00325", "Không tìm thấy kế hoạch");

        return sendResponse(res, 200, "00330", "Kế hoạch bữa ăn của bạn đã được xóa thành công");
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 4. Cập nhật kế hoạch
exports.updateMealPlan = async (req, res) => {
    try {
        const { planId, newFoodName, newName } = req.body;

        if (!planId) return sendResponse(res, 400, "00332", "Vui lòng cung cấp một ID kế hoạch.");
        if (!newFoodName && !newName) {
            return sendResponse(res, 400, "00333", "Vui lòng cung cấp ít nhất một trong các trường cần sửa.");
        }

        const plan = await MealPlan.findOne({ _id: planId, groupId: req.user.groupId });
        if (!plan) return sendResponse(res, 404, "00325", "Không tìm thấy kế hoạch");

        if (newFoodName) {
            const food = await Food.findOne({ name: newFoodName, groupId: req.user.groupId });
            if (!food) return sendResponse(res, 404, "00317", "Không tìm thấy thực phẩm mới");
            plan.foodId = food._id;
        }

        if (newName) {
            const validSessions = ['sáng', 'trưa', 'tối'];
            if (!validSessions.includes(newName.toLowerCase())) {
                return sendResponse(res, 400, "00336", "Vui lòng cung cấp một tên hợp lệ, sáng, trưa, tối");
            }
            plan.session = newName;
        }

        await plan.save();
        return sendResponse(res, 200, "00344", "Cập nhật kế hoạch bữa ăn thành công", plan);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 5. Lấy danh sách các ngày có bữa ăn (Get dates having meals)
exports.getMealDates = async (req, res) => {
    try {
        if (!req.user.groupId) return sendResponse(res, 400, "00319", "Chưa vào nhóm");

        // Tìm tất cả các plan của group, chỉ lấy trường date
        const plans = await MealPlan.find({ groupId: req.user.groupId }, 'date');

        // Extract dates and format to YYYY-MM-DD
        const dates = plans.map(p => {
            try {
                return p.date.toISOString().split('T')[0];
            } catch (e) { return null; }
        }).filter(d => d);

        // Unique
        const uniqueDates = [...new Set(dates)];

        return sendResponse(res, 200, "00348", "Lấy danh sách ngày thành công", uniqueDates);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};