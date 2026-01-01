const FridgeItem = require('../models/FridgeItem');
const Food = require('../models/food');
const sendResponse = require('../utils/responseHelper');

// 1. Thêm đồ vào tủ lạnh
exports.createFridgeItem = async (req, res) => {
    try {
        const { foodName, useWithin, quantity, note } = req.body;

        // Check 00203: Thiếu trường bắt buộc
        if (!foodName || !useWithin || !quantity) {
            return sendResponse(res, 400, "00203", "Vui lòng cung cấp tất cả các trường cần thiết");
        }

        // Check 00210: Chưa vào nhóm
        if (!req.user.groupId) {
             return sendResponse(res, 400, "00210", "Người dùng không thuộc bất kỳ nhóm nào");
        }

        // --- Logic tìm Food ID từ Name ---
        const food = await Food.findOne({ name: foodName, groupId: req.user.groupId });
        
        // Check 00208: Thực phẩm không tồn tại
        if (!food) {
            return sendResponse(res, 404, "00208", "Thực phẩm không tồn tại.");
        }

        // Check 00199: Món này đã có trong tủ chưa?
        const existingItem = await FridgeItem.findOne({ foodId: food._id, groupId: req.user.groupId });
        if (existingItem) {
            return sendResponse(res, 400, "00199", "Mục trong tủ lạnh cho thực phẩm đã tồn tại.");
        }

        // Tạo item mới
        const newItem = new FridgeItem({
            foodId: food._id,
            groupId: req.user.groupId,
            quantity,
            useWithin,
            note: note || ''
        });

        await newItem.save();
        return sendResponse(res, 200, "00202", "Mục trong tủ lạnh được tạo thành công.", newItem);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 2. Lấy danh sách đồ trong tủ
exports.getFridgeItems = async (req, res) => {
    try {
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00210", "Người dùng không thuộc bất kỳ nhóm nào");
        }

        const items = await FridgeItem.find({ groupId: req.user.groupId })
            .populate('foodId', 'name image unitId categoryId'); // Lấy chi tiết món ăn kèm theo
            
        return sendResponse(res, 200, "00228", "Lấy danh sách đồ tủ lạnh thành công", items);
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 3. Xóa đồ khỏi tủ (Logic phụ thêm theo API Delete)
exports.deleteFridgeItem = async (req, res) => {
    try {
        const { foodName } = req.body; // API yêu cầu gửi foodName để xóa [cite: 69]

        if (!foodName) return sendResponse(res, 400, "00217", "Vui lòng cung cấp tên thực phẩm");

        // Tìm foodId trước
        const food = await Food.findOne({ name: foodName, groupId: req.user.groupId });
        if (!food) return sendResponse(res, 404, "00218", "Không tìm thấy thực phẩm");

        // Xóa item
        const result = await FridgeItem.findOneAndDelete({ foodId: food._id, groupId: req.user.groupId });
        
        if (!result) return sendResponse(res, 404, "00213", "Mục tủ lạnh không tồn tại.");

        return sendResponse(res, 200, "00224", "Xóa mục trong tủ lạnh thành công");
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
}