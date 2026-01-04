const FridgeItem = require('../models/FridgeItem');
const Food = require('../models/food');
const Category = require('../models/category');
const Unit = require('../models/unit');
const sendResponse = require('../utils/responseHelper');
const notificationService = require('../services/notification.service');
const cron = require('node-cron');
const dayjs = require('dayjs');

// 1. Thêm đồ vào tủ lạnh (Kèm logic tạo Food nếu chưa có)
exports.createFridgeItem = async (req, res) => {
    try {
        // Lấy thông tin từ request
        // Lưu ý: categoryName và unitName chỉ bắt buộc nếu Food chưa tồn tại
        const { foodName, compartment, categoryName, unitName, quantity, useWithin, note } = req.body;
        const file = req.file;

        // Check 00203: Thiếu trường bắt buộc cơ bản
        if (!foodName || !useWithin || !quantity) {
            return sendResponse(res, 400, "00203", "Vui lòng cung cấp tên, số lượng và hạn sử dụng");
        }

        // Check 00210: Chưa vào nhóm
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00210", "Người dùng không thuộc bất kỳ nhóm nào");
        }

        const validCompartments = ['Freezer', 'Cooler'];
        const selectedCompartment = validCompartments.includes(compartment) ? compartment : 'Cooler';

        // --- Logic tìm hoặc tạo Food ---
        let food = await Food.findOne({ name: foodName, groupId: req.user.groupId });

        if (!food) {
            // Food chưa tồn tại => Tự động tạo mới
            // Nếu thiếu categoryName hoặc unitName thì gán giá trị mặc định để không lỗi
            const targetCategoryName = categoryName || 'Khác';
            const targetUnitName = unitName || 'cái';

            // Tìm hoặc Tạo Category
            let category = await Category.findOne({ name: targetCategoryName });
            if (!category) {
                category = new Category({ name: targetCategoryName });
                await category.save();
            }

            // Tìm hoặc Tạo Unit
            let unit = await Unit.findOne({ name: targetUnitName });
            if (!unit) {
                unit = new Unit({ name: targetUnitName });
                await unit.save();
            }

            // Xử lý ảnh
            let imagePath = '';
            if (file) {
                imagePath = file.path.replace(/\\/g, "/");
            }

            // Tạo Food mới
            food = new Food({
                name: foodName,
                categoryId: category._id,
                unitId: unit._id,
                groupId: req.user.groupId,
                image: imagePath,
                createdBy: req.user._id
            });
            await food.save();
        }

        // --- Logic thêm vào tủ lạnh ---
        // Xử lý quantity: Ghép số lượng + tên đơn vị (nếu user cung cấp unitName)
        let finalQuantity = quantity.toString();
        if (unitName) {
            finalQuantity = `${quantity} ${unitName}`;
        }

        // Check 00199: Món này đã có trong tủ chưa?

        const existingItem = await FridgeItem.findOne({ foodId: food._id, groupId: req.user.groupId });
        // User không yêu cầu cụ thể, nhưng để tránh conflict data, ta giữ 00199.
        if (existingItem) {
            return sendResponse(res, 400, "00199", "Mục trong tủ lạnh cho thực phẩm đã tồn tại. Vui lòng cập nhật số lượng thay vì tạo mới.");
        }

        // Tạo item mới
        const newItem = new FridgeItem({
            foodId: food._id,
            groupId: req.user.groupId,
            quantity: finalQuantity,
            useWithin,
            note: note || '',
            compartment: selectedCompartment
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
};

// 4. Cập nhật đồ trong tủ
exports.updateFridgeItem = async (req, res) => {
    try {
        const { itemId, newQuantity, newUseWithin } = req.body;

        if (!itemId) {
            return sendResponse(res, 400, "00204", "Vui lòng cung cấp id của item tủ lạnh.");
        }
        if (!newQuantity && !newUseWithin) {
            return sendResponse(res, 400, "00204 X", "Vui lòng cung cấp ít nhất một trong các trường cần update.");
        }

        const item = await FridgeItem.findOne({ _id: itemId, groupId: req.user.groupId });
        if (!item) {
            // Không có mã lỗi not found cho update, tạm dùng 404
            return sendResponse(res, 404, "00213", "Mục tủ lạnh không tồn tại.");
        }

        if (newQuantity) item.quantity = newQuantity;
        if (newUseWithin) item.useWithin = newUseWithin;

        await item.save();
        return sendResponse(res, 200, "00216", "Cập nhật mục tủ lạnh thành công", item);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 5. Lấy thông tin 1 item cụ thể (qua foodName param)
exports.getFridgeItemDetail = async (req, res) => {
    try {
        const { foodName } = req.params;

        // Tìm foodId
        const food = await Food.findOne({ name: foodName, groupId: req.user.groupId });
        if (!food) {
            return sendResponse(res, 404, "00208", "Thực phẩm không tồn tại.");
        }

        const item = await FridgeItem.findOne({ foodId: food._id, groupId: req.user.groupId })
            .populate('foodId', 'name image unitId categoryId');

        if (!item) {
            return sendResponse(res, 404, "00213", "Mục tủ lạnh không tồn tại.");
        }

        return sendResponse(res, 200, "00237", "Lấy item cụ thể thành công", item);

    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 6. Thông báo đồ sắp/đã hết hạn vào 7h sáng hàng ngày
cron.schedule('0 7 * * *', async () => {
    try {
        const today = dayjs().startOf('day');

        // Lấy tất cả item có hạn sử dụng
        const items = await FridgeItem.find({ useWithin: { $exists: true } })
            .populate('foodId', 'name groupId');

        // Gom theo group
        const grouped = {};
        for (const item of items) {
            const groupId = item.groupId?.toString() || item.foodId?.groupId?.toString();
            if (!groupId) continue;

            const expDate = dayjs(item.useWithin);
            const diff = expDate.diff(today, 'day'); // số ngày còn lại

            if (!grouped[groupId]) grouped[groupId] = { expiring: [], expired: [] };
            if (diff < 0) {
                grouped[groupId].expired.push(item.foodId?.name || 'Thực phẩm');
            } else if (diff <= 2) {
                grouped[groupId].expiring.push(item.foodId?.name || 'Thực phẩm');
            }
        }

        // Gửi thông báo cho từng group
        const groupIds = Object.keys(grouped);
        for (const gid of groupIds) {
            const { expiring, expired } = grouped[gid];

            if (expiring.length > 0) {
                await notificationService.sendToGroup(
                    gid,
                    'Thực phẩm sắp hết hạn',
                    `Các món: ${expiring.join(', ')} sẽ hết hạn trong 2 ngày tới.`,
                    { type: 'fridge_expiring', groupId: gid }
                );
            }
            if (expired.length > 0) {
                await notificationService.sendToGroup(
                    gid,
                    'Thực phẩm đã hết hạn',
                    `Các món: ${expired.join(', ')} đã quá hạn. Vui lòng kiểm tra.`,
                    { type: 'fridge_expired', groupId: gid }
                );
            }
        }
    } catch (error) {
        console.error('❌ Cron fridge notification error:', error);
    }
});