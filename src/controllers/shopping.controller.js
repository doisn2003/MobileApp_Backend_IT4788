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
        if (!req.user.groupId) {
            return sendResponse(res, 403, "00281", "Người dùng chưa tham gia nhóm nào");
        }
        if (!shoppingList.groupId) {
            // Trường hợp hy hữu dữ liệu cũ lỗi
            return sendResponse(res, 403, "00281", "Danh sách không hợp lệ (thiếu nhóm)");
        }

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
};

// 5. Cập nhật danh sách mua sắm
exports.updateShoppingList = async (req, res) => {
    try {
        const { listId, newName } = req.body;
        if (!listId) {
            return sendResponse(res, 400, "00251", "Vui lòng cung cấp id danh sách.");
        }
        if (!newName) {
            return sendResponse(res, 400, "00252", "Vui lòng cung cấp ít nhất một trong những trường cần sửa.");
        }

        const list = await ShoppingList.findOne({ _id: listId, groupId: req.user.groupId });
        if (!list) return sendResponse(res, 404, "00260", "Không tìm thấy danh sách mua sắm");

        list.name = newName;
        await list.save();
        return sendResponse(res, 200, "00266", "Cập nhật danh sách mua sắm thành công", list);
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 6. Xóa danh sách mua sắm
exports.deleteShoppingList = async (req, res) => {
    try {
        const { listId } = req.body;

        const list = await ShoppingList.findOneAndDelete({ _id: listId, groupId: req.user.groupId });
        if (!list) return sendResponse(res, 404, "00260", "Không tìm thấy danh sách mua sắm");

        // Xóa luôn các task liên quan?
        await Task.deleteMany({ listId: listId });

        return sendResponse(res, 200, "00275", "Xóa danh sách mua sắm thành công");
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 7. Cập nhật Task
exports.updateTask = async (req, res) => {
    try {
        const { taskId, newFoodName } = req.body; // ... và các field khác nếu cần. Ở đây follow API_Without.md

        if (!taskId) return sendResponse(res, 400, "00301", "Vui lòng cung cấp một ID nhiệm vụ.");
        if (!newFoodName) return sendResponse(res, 400, "00302", "Vui lòng cung cấp ít nhất một trường để sửa.");

        // Check task có thuộc group mình không
        // Phải query Task -> List -> GroupId
        // Tuy nhiên để tối ưu query, ta có thể check sau. 
        // Nhưng Task có foodId, từ foodId có groupId
        // Cách đơn giản nhất:
        const task = await Task.findById(taskId);
        if (!task) return sendResponse(res, 404, "00296", "Không tìm thấy nhiệm vụ với ID đã cung cấp");

        // Check ownership qua List
        const list = await ShoppingList.findById(task.listId);
        if (!list || list.groupId.toString() !== req.user.groupId.toString()) {
            return sendResponse(res, 403, "00281", "Bạn không có quyền sửa task này");
        }

        // Logic update: nếu đổi tên món, thì phải đổi ID món
        const newFood = await Food.findOne({ name: newFoodName, groupId: req.user.groupId });
        if (!newFood) return sendResponse(res, 404, "00285", "Không tìm thấy món ăn mới");

        task.foodId = newFood._id;
        await task.save();

        return sendResponse(res, 200, "00312", "Cập nhật nhiệm vụ thành công");

    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 8. Xóa Task
exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        // Check ownership tương tự updateTask

        const task = await Task.findById(taskId);
        if (!task) return sendResponse(res, 404, "00296", "Không tìm thấy nhiệm vụ với ID đã cung cấp.");

        const list = await ShoppingList.findById(task.listId);
        if (!list || list.groupId.toString() !== req.user.groupId.toString()) {
            return sendResponse(res, 403, "00281", "Bạn không có quyền xóa task này");
        }

        await Task.findByIdAndDelete(taskId);
        return sendResponse(res, 200, "00299", "Xóa nhiệm vụ thành công.");

    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};