const ShoppingList = require('../models/shoppingList');
const Task = require('../models/task');
const User = require('../models/user');
const Food = require('../models/food');
const sendResponse = require('../utils/responseHelper');

// 1. Tạo Danh Sách Mua Sắm (Shopping List)
exports.createShoppingList = async (req, res) => {
    try {
        const { name, assignToUsername, note, date } = req.body;

        // Check 00250: Thiếu trường
        if (!name || !assignToUsername || !date) {
            return sendResponse(res, 400, "00250", "Vui cung cấp tất cả các trường cần thiết");
        }

        if (!req.user.groupId) {
             return sendResponse(res, 400, "00258", "Người dùng không thuộc nhóm nào");
        }

        // --- Tìm User ID từ Username ---
        const assignee = await User.findOne({ username: assignToUsername });
        if (!assignee) {
            return sendResponse(res, 404, "00245", "Tên người dùng được gán không tồn tại.");
        }

        // Optional: Check xem người được gán có trong nhóm không? (Logic nâng cao)
        // Tạm thời bỏ qua để đơn giản hóa, hoặc bạn có thể check:
        if (assignee.groupId.toString() !== req.user.groupId.toString()) {
             return sendResponse(res, 400, "00246", "Người được gán không thuộc nhóm của bạn.");
        }

        // Tạo List
        const newList = new ShoppingList({
            name,
            date,
            note,
            groupId: req.user.groupId,
            ownerId: req.user._id,
            assigneeId: assignee._id
        });

        await newList.save();
        return sendResponse(res, 200, "00249", "Danh sách mua sắm đã được tạo thành công.", newList);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 2. Tạo Task (Các món cần mua trong List) - API này dùng JSON Body!
exports.createTasks = async (req, res) => {
    try {
        // Body: { listId: "...", tasks: [ { foodName: "A", quantity: "1" }, ... ] }
        const { listId, tasks } = req.body; 

        // Check 00277
        if (!listId) return sendResponse(res, 400, "00277", "Vui lòng cung cấp ID của danh sách");
        // Check 00278
        if (!tasks || !Array.isArray(tasks)) return sendResponse(res, 400, "00278", "Vui lòng cung cấp mảng nhiệm vụ");

        // Kiểm tra List có tồn tại không
        const shoppingList = await ShoppingList.findById(listId);
        if (!shoppingList) return sendResponse(res, 404, "00283", "Không tìm thấy danh sách mua sắm");

        // Check quyền: Phải cùng nhóm mới được thêm task
        if (shoppingList.groupId.toString() !== req.user.groupId.toString()) {
            return sendResponse(res, 403, "00281", "Bạn không có quyền thêm vào danh sách nhóm khác");
        }

        // --- Xử lý vòng lặp tạo Task ---
        const createdTasks = [];
        
        for (const item of tasks) {
            // Tìm FoodId từ foodName
            const food = await Food.findOne({ name: item.foodName, groupId: req.user.groupId });
            
            // Nếu không tìm thấy món ăn, return lỗi luôn (hoặc bỏ qua tùy logic)
            // Theo mã lỗi 00285: Không tìm thấy món ăn
            if (!food) {
                return sendResponse(res, 404, "00285", `Không tìm thấy món ăn: ${item.foodName}`);
            }

            // Tạo Task
            const newTask = new Task({
                listId: listId,
                foodId: food._id,
                quantity: item.quantity
            });
            await newTask.save();
            createdTasks.push(newTask);
        }

        return sendResponse(res, 200, "00287", "Thêm nhiệm vụ thành công", createdTasks);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 3. Lấy danh sách các Shopping List (Để hiển thị lên app)
exports.getShoppingLists = async (req, res) => {
    try {
        if (!req.user.groupId) return sendResponse(res, 400, "00258", "Chưa vào nhóm");

        const lists = await ShoppingList.find({ groupId: req.user.groupId })
            .populate('assigneeId', 'name username avatar') // Lấy thông tin người được giao
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, "00292", "Lấy danh sách thành công", lists);
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 4. Lấy chi tiết các Task trong 1 List
exports.getTasksByList = async (req, res) => {
    try {
        // Có thể gửi listId qua query param: ?listId=...
        const { listId } = req.query;
        
        if (!listId) return sendResponse(res, 400, "00277", "Thiếu listId");

        const tasks = await Task.find({ listId: listId })
            .populate('foodId', 'name image unitId categoryId'); // Populate để lấy ảnh hiển thị

        return sendResponse(res, 200, "00292", "Lấy task thành công", tasks);
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
}