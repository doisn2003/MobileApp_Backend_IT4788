const MealPlan = require('../models/mealPlan');
const Food = require('../models/food');
const sendResponse = require('../utils/responseHelper');

// 1. Tạo kế hoạch bữa ăn (Create Meal Plan)
exports.createMealPlan = async (req, res) => {
    try {
        // Body: { foodName, timestamp, name } [cite: 71]
        // Lưu ý: 'name' ở đây là buổi (sáng/trưa/tối)
        // 'timestamp' là ngày (VD: "2025-10-25")
        const { foodName, timestamp, name } = req.body;

        // Check 00323: Thiếu trường
        if (!foodName || !timestamp || !name) {
            return sendResponse(res, 400, "00323", "Vui lòng cung cấp tất cả các trường bắt buộc");
        }

        if (!req.user.groupId) {
             return sendResponse(res, 400, "00319", "Người dùng không phải là quản trị viên nhóm"); // Mã lỗi tạm dùng chung
        }

        // Check 00336: Validate buổi (Sáng/Trưa/Tối)
        const validSessions = ['sáng', 'trưa', 'tối'];
        if (!validSessions.includes(name.toLowerCase())) {
            return sendResponse(res, 400, "00336", "Vui lòng cung cấp một tên hợp lệ, sáng, trưa, tối");
        }

        // Tìm Food ID
        const food = await Food.findOne({ name: foodName, groupId: req.user.groupId });
        // Check 00317: Không tìm thấy món
        if (!food) {
            return sendResponse(res, 404, "00317", "Không tìm thấy thực phẩm với tên đã cung cấp");
        }

        // Tạo Meal Plan
        const newPlan = new MealPlan({
            date: new Date(timestamp), // Chuyển chuỗi ngày thành Date object
            session: name,
            foodId: food._id,
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
        // Query param: ?date=2025-10-25 [cite: 71]
        const { date } = req.query;

        if (!date) {
            return sendResponse(res, 400, "00331", "Vui lòng cung cấp ngày");
        }

        // Xử lý tìm kiếm theo ngày (trong khoảng từ 00:00 đến 23:59 của ngày đó)
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1); // Cộng thêm 1 ngày để lấy mốc chặn trên

        const plans = await MealPlan.find({
            groupId: req.user.groupId,
            date: {
                $gte: startDate, // Lớn hơn hoặc bằng đầu ngày
                $lt: endDate     // Nhỏ hơn đầu ngày hôm sau
            }
        })
        .populate('foodId', 'name image unitId categoryId') // Lấy thông tin món ăn để hiển thị
        .sort({ session: 1 }); // Sắp xếp (có thể cần logic sort custom nếu muốn Sáng -> Trưa -> Tối chuẩn xác)

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