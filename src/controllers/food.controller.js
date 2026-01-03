const Food = require('../models/food');
const Category = require('../models/category');
const Unit = require('../models/unit');
const sendResponse = require('../utils/responseHelper');

const fs = require('fs');
const path = require('path');

// 1. Tạo thực phẩm mới (Create Food)
exports.createFood = async (req, res) => {
    try {
        // Lưu ý: Khi dùng multer, dữ liệu text nằm trong req.body, file nằm trong req.file
        const { name, foodCategoryName, unitName } = req.body;
        const file = req.file;

        // Check 00147: Thiếu trường bắt buộc
        if (!name || !foodCategoryName || !unitName) {
            return sendResponse(res, 400, "00147", "Vui lòng cung cấp tất cả các trường bắt buộc!");
        }

        // Check 00156 X: Phải thuộc 1 nhóm mới được tạo đồ ăn
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00156 X", "Hãy vào nhóm trước để tạo thực phẩm");
        }

        // --- LOGIC TÌM ID TỪ NAME (QUAN TRỌNG) ---

        // 1. Tìm Category ID
        const category = await Category.findOne({ name: foodCategoryName });
        if (!category) {
            return sendResponse(res, 404, "00155", "Không tìm thấy category với tên cung cấp");
        }

        // 2. Tìm Unit ID
        const unit = await Unit.findOne({ name: unitName });
        if (!unit) {
            return sendResponse(res, 404, "00153", "Không tìm thấy đơn vị với tên cung cấp");
        }

        // 3. Check 00151: Món ăn này đã có trong nhóm chưa?
        const existingFood = await Food.findOne({
            name: name,
            groupId: req.user.groupId
        });
        if (existingFood) {
            return sendResponse(res, 400, "00151", "Đã tồn tại thức ăn với tên này trong nhóm");
        }

        // 4. Xử lý đường dẫn ảnh
        let imagePath = '';
        if (file) {
            // Lưu đường dẫn tương đối (ví dụ: uploads/abc.jpg)
            imagePath = file.path.replace(/\\/g, "/");
        }

        // Tạo Food
        const newFood = new Food({
            name,
            categoryId: category._id,
            unitId: unit._id,
            groupId: req.user.groupId,
            image: imagePath,
            createdBy: req.user._id
        });

        await newFood.save();

        return sendResponse(res, 200, "00160", "Tạo thực phẩm thành công", newFood);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00152", "Server error");
    }
};

// 2. Lấy danh sách thực phẩm trong nhóm (Get all foods in group)
exports.getFoods = async (req, res) => {
    try {
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00156 X", "Bạn chưa vào nhóm nào");
        }

        const foods = await Food.find({ groupId: req.user.groupId })
            .populate('categoryId', 'name')
            .populate('unitId', 'name'); // Populate để lấy tên ra hiển thị

        return sendResponse(res, 200, "00188", "Lấy danh sách thực phẩm thành công", foods);
    } catch (error) {
        return sendResponse(res, 500, "00152", "Server error");
    }
};

// 3. Cập nhật thực phẩm
exports.updateFood = async (req, res) => {
    try {
        // Body: name, newName, newCategory, newUnit, image (file)
        const { name, newName, newCategory, newUnit } = req.body;
        const file = req.file;

        if (!name || (!newName && !newCategory && !newUnit && !file)) {
            // Mã 00163: Vui lòng cung cấp ít nhất một trong các trường sau
            return sendResponse(res, 400, "00163", "Vui lòng cung cấp ít nhất một trong các trường sau (newName, newCategory, newUnit, image).");
        }

        const food = await Food.findOne({ name: name, groupId: req.user.groupId });
        if (!food) {
            return sendResponse(res, 404, "00167", "Thực phẩm với tên đã cung cấp không tồn tại.");
        }

        // Check quyền (tạm thời ai trong nhóm cũng sửa được hoặc check admin)
        // Mã 00167 X: Bạn không có quyền chỉnh sửa
        // if (req.user.role !== 'admin' && food.createdBy.toString() !== req.user._id.toString()) {
        //      return sendResponse(res, 403, "00167 X", "Bạn không có quyền chỉnh sửa.");
        // }

        if (newName) food.name = newName;
        if (newCategory) {
            const catObj = await Category.findOne({ name: newCategory });
            if (catObj) food.categoryId = catObj._id;
        }
        if (newUnit) {
            const unitObj = await Unit.findOne({ name: newUnit });
            if (unitObj) food.unitId = unitObj._id;
        }
        if (file) {
            food.image = file.path.replace(/\\/g, "/");
        }

        await food.save();
        return sendResponse(res, 200, "00161", "Cập nhật thực phẩm thành công (dùng tạm message success)", food);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00152", "Server error");
    }
};

// 4. Xóa thực phẩm
exports.deleteFood = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return sendResponse(res, 400, "00179", "Vui lòng cung cấp tên thực phẩm.");
        }

        const food = await Food.findOne({ name: name, groupId: req.user.groupId });
        if (!food) {
            return sendResponse(res, 404, "00180", "Không tìm thấy thực phẩm với tên đã cung cấp.");
        }

        // Delete image if exists
        if (food.image) {
            try {
                // Assuming food.image is relative path like 'uploads/file.jpg'
                // We resolve it relative to the project root (where process.cwd() usually is, or relative to this file)
                // Since this file is in src/controllers, and uploads is in root/uploads
                // path.join(__dirname, '../../', food.image) might be safer if food.image is relative

                // Check if it is a local file path (not http)
                if (!food.image.startsWith('http')) {
                    const absolutePath = path.resolve(food.image);
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                    }
                }
            } catch (err) {
                console.error("Failed to delete image file:", err);
                // Continue to delete db record even if file delete fails
            }
        }

        await Food.findByIdAndDelete(food._id);
        return sendResponse(res, 200, "00184", "Xóa thực phẩm thành công.");
    } catch (error) {
        return sendResponse(res, 500, "00152", "Server error");
    }
};

// 5. Lấy danh sách Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}, 'name description'); // Lấy name và description
        return sendResponse(res, 200, "00188", "Success", categories);
    } catch (e) {
        console.error(e);
        return sendResponse(res, 500, "00152", "Server error");
    }
};

// 6. Lấy danh sách Units
exports.getAllUnits = async (req, res) => {
    try {
        const units = await Unit.find({}, 'name description');
        return sendResponse(res, 200, "00188", "Success", units);
    } catch (e) {
        console.error(e);
        return sendResponse(res, 500, "00152", "Server error");
    }
};