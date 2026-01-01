const Food = require('../models/food');
const Category = require('../models/category');
const Unit = require('../models/unit');
const sendResponse = require('../utils/responseHelper');

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