const Category = require('../models/category');
const Unit = require('../models/unit');
const sendResponse = require('../utils/responseHelper');

// --- PHẦN CATEGORY ---

// 1. Tạo Category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body; // Body: { 'name': string }

        // Check 00131: Thiếu tên
        if (!name) {
            return sendResponse(res, 400, "00131", "Thiếu thông tin tên của category");
        }

        // Check 00132: Đã tồn tại
        const existing = await Category.findOne({ name });
        if (existing) {
            return sendResponse(res, 400, "00132", "Đã tồn tại category có tên này");
        }

        const newCat = new Category({ name });
        await newCat.save();

        return sendResponse(res, 200, "00135", "Tạo category thành công", newCat);
    } catch (error) {
        return sendResponse(res, 500, "00133", "Server error");
    }
};

// 2. Lấy danh sách Category
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return sendResponse(res, 200, "00129", "Lấy các category thành công", categories);
    } catch (error) {
        return sendResponse(res, 500, "00133", "Server error");
    }
};

// --- PHẦN UNIT ---

// 3. Tạo Unit
exports.createUnit = async (req, res) => {
    try {
        // CẢNH BÁO: API yêu cầu field là 'unitName', không phải 'name'
        const { unitName } = req.body;

        // Check 00112: Thiếu tên
        if (!unitName) {
            return sendResponse(res, 400, "00112", "Thiếu thông tin tên của đơn vị");
        }

        // Check 00113: Đã tồn tại (Lưu vào DB thì map 'unitName' -> 'name')
        const existing = await Unit.findOne({ name: unitName });
        if (existing) {
            return sendResponse(res, 400, "00113", "Đã tồn tại đơn vị có tên này");
        }

        const newUnit = new Unit({ name: unitName });
        await newUnit.save();

        return sendResponse(res, 200, "00116", "Tạo đơn vị thành công", newUnit);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00114", "Server error");
    }
};

// 4. Lấy danh sách Unit
exports.getUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        return sendResponse(res, 200, "00110", "Lấy các unit thành công", units);
    } catch (error) {
        return sendResponse(res, 500, "00114", "Server error");
    }
};

// --- CẬP NHẬT / XÓA ---

// 5. Sửa Category
exports.updateCategory = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return sendResponse(res, 400, "00136", "Thiếu thông tin name cũ, name mới");
        }
        if (oldName === newName) {
            return sendResponse(res, 400, "00137", "Tên cũ trùng với tên mới");
        }
        const category = await Category.findOne({ name: oldName });
        if (!category) {
            return sendResponse(res, 404, "00138", "Không tìm thấy category với tên cung cấp");
        }
        const updatedCat = await Category.findOneAndUpdate({ name: oldName }, { name: newName }, { new: true });
        return sendResponse(res, 200, "00141", "Sửa đổi category thành công", updatedCat);
    } catch (error) {
        return sendResponse(res, 500, "00133", "Server error");
    }
};

// 6. Xóa Category
exports.deleteCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return sendResponse(res, 400, "00142", "Thiếu thông tin tên của category");
        }
        const category = await Category.findOneAndDelete({ name });
        if (!category) {
            return sendResponse(res, 404, "00143", "Không tìm thấy category với tên cung cấp");
        }
        return sendResponse(res, 200, "00146", "Xóa category thành công");
    } catch (error) {
        return sendResponse(res, 500, "00133", "Server error");
    }
};

// 7. Sửa Unit
exports.updateUnit = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return sendResponse(res, 400, "00117", "Thiếu thông tin name cũ, name mới");
        }
        if (oldName === newName) {
            return sendResponse(res, 400, "00118", "Tên cũ trùng với tên mới");
        }
        const unit = await Unit.findOne({ name: oldName });
        if (!unit) {
            // Lưu ý: Mã lỗi 00125 thường dùng cho delete, nhưng ở đây có thể dùng chung logic not found
            // Tuy nhiên đề bài không ghi mã lỗi not found cho update unit, ta dùng tạm mã lỗi chung 
            // Nhưng check lại API_Without.md không thấy, ta dùng mã 404
            return sendResponse(res, 404, "00125", "Không tìm thấy đơn vị với tên cung cấp");
        }
        const updatedUnit = await Unit.findOneAndUpdate({ name: oldName }, { name: newName }, { new: true });
        return sendResponse(res, 200, "00122", "Sửa đổi đơn vị thành công", updatedUnit);
    } catch (error) {
        return sendResponse(res, 500, "00114", "Server error");
    }
};

// 8. Xóa Unit
exports.deleteUnit = async (req, res) => {
    try {
        const { unitName } = req.body;
        if (!unitName) {
            return sendResponse(res, 400, "00123", "Thiếu thông tin tên của đơn vị");
        }
        const unit = await Unit.findOneAndDelete({ name: unitName });
        if (!unit) {
            return sendResponse(res, 404, "00125", "Không tìm thấy đơn vị với tên cung cấp");
        }
        return sendResponse(res, 200, "00128", "Xóa đơn vị thành công");
    } catch (error) {
        return sendResponse(res, 500, "00114", "Server error");
    }
};

// 9. Get Logs
exports.getLogs = async (req, res) => {
    return sendResponse(res, 200, "00109", "Lấy log hệ thống thành công", []);
};