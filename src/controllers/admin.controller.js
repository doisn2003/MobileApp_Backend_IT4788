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