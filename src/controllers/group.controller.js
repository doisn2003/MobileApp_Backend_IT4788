const Group = require('../models/group');
const User = require('../models/user');
const sendResponse = require('../utils/responseHelper');
const notificationService = require('../services/notification.service');

// 1. Tạo nhóm (Create Group)
exports.createGroup = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check 00093: Đã có nhóm chưa?
        if (req.user.groupId) {
            return sendResponse(res, 400, "00093", "Không thể tạo nhóm, bạn đã thuộc về một nhóm rồi");
        }

        // Tạo nhóm mới
        const newGroup = new Group({
            name: `Gia đình của ${req.user.name}`,
            adminId: userId,
            members: [userId] // Admin cũng là thành viên
        });
        await newGroup.save();

        // Cập nhật user: gán groupId
        req.user.groupId = newGroup._id;
        await req.user.save();

        return sendResponse(res, 200, "00095", "Tạo nhóm thành công", newGroup);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 2. Thêm thành viên (Add Member)
exports.addMember = async (req, res) => {
    try {
        // Body: { "username": "..." } 
        const { username } = req.body;

        // Check 00100: Thiếu username
        if (!username) {
            return sendResponse(res, 400, "00100", "Thiếu username");
        }

        // Check 00096: Bạn chưa có nhóm thì sao thêm người được?
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00096", "Bạn không thuộc về nhóm nào");
        }

        // Lấy thông tin nhóm hiện tại
        const currentGroup = await Group.findById(req.user.groupId);

        // Check 00104: Bạn có phải admin không?
        if (currentGroup.adminId.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, "00104", "Bạn không phải admin, không thể thêm/xóa");
        }

        // Tìm user muốn thêm
        const memberToAdd = await User.findOne({ username });
        if (!memberToAdd) {
            return sendResponse(res, 404, "00099 X", "Không tồn tại user này"); // Mã 00099 X trong bảng lỗi
        }

        // Check 00099: Người này đã có nhóm chưa?
        if (memberToAdd.groupId) {
            return sendResponse(res, 400, "00099", "Người này đã thuộc về một nhóm");
        }

        // Thêm vào nhóm
        currentGroup.members.push(memberToAdd._id);
        await currentGroup.save();

        // Cập nhật user kia
        memberToAdd.groupId = currentGroup._id;
        await memberToAdd.save();

        // Gửi PUSH notification (về việc được thêm vào nhóm)
        if (memberToAdd.fcmToken) {
            try {
                await notificationService.sendPushNotification(
                    memberToAdd.fcmToken,
                    'Chào mừng đến nhóm!',
                    `Bạn đã được thêm vào nhóm "${currentGroup.name}"!`,
                    { 
                        type: 'new_member',
                        groupId: currentGroup._id.toString(),
                        groupName: currentGroup.name
                    }
                );
            } catch (notifError) {
                console.error('⚠️  Failed to send notification:', notifError);
                // Không throw error, vẫn trả về success
            }
        }

        return sendResponse(res, 200, "00102", "Người dùng thêm vào nhóm thành công");

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 3. Lấy danh sách thành viên
exports.getGroupMembers = async (req, res) => {
    try {
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00096", "Bạn không thuộc về nhóm nào");
        }

        const group = await Group.findById(req.user.groupId).populate('members', 'id username name email avatar');

        return sendResponse(res, 200, "00098", "Thành công", group.members);
    } catch (error) {
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 4. Xóa thành viên
exports.removeMember = async (req, res) => {
    try {
        const { memberId } = req.body;

        if (!memberId) {
            return sendResponse(res, 400, "00100", "Thiếu memberId");
        }

        if (!req.user.groupId) {
            return sendResponse(res, 400, "00096", "Bạn không thuộc về nhóm nào");
        }

        const currentGroup = await Group.findById(req.user.groupId);

        if (currentGroup.adminId.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, "00104", "Bạn không phải admin, không thể xóa thành viên");
        }

        // Không cho phép xóa chính admin (nếu admin muốn thoát thì phải xóa nhóm hoặc chuyển admin)
        // Nhưng ở đây chỉ xóa member.
        if (memberId === req.user._id.toString()) {
            return sendResponse(res, 400, "00105", "Không thể xóa admin khỏi nhóm. Hãy dùng chức năng xóa nhóm nếu muốn giải tán.");
        }

        if (!currentGroup.members.includes(memberId)) {
            return sendResponse(res, 404, "00099", "Thành viên không tồn tại trong nhóm này");
        }

        // Xóa khỏi mảng members
        currentGroup.members = currentGroup.members.filter(id => id.toString() !== memberId);
        await currentGroup.save();

        // Cập nhật user bị xóa
        const memberUser = await User.findById(memberId);
        if (memberUser) {
            memberUser.groupId = null;
            await memberUser.save();
        }

        // Gửi PUSH notification (về việc bị xoá khỏi nhóm)
        if (memberToAdd.fcmToken) {
            try {
                await notificationService.sendPushNotification(
                    memberToAdd.fcmToken,
                    'Bạn đã bị xoá khỏi nhóm!',
                    `Bạn đã bị xoá khỏi nhóm "${currentGroup.name}"!`,
                    { 
                        type: 'removed_member',
                        groupId: currentGroup._id.toString(),
                        groupName: currentGroup.name
                    }
                );
            } catch (notifError) {
                console.error('⚠️  Failed to send notification:', notifError);
                // Không throw error, vẫn trả về success
            }
        }

        return sendResponse(res, 200, "00103", "Xóa thành viên thành công");
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 5. Xóa nhóm
exports.deleteGroup = async (req, res) => {
    try {
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00096", "Bạn không thuộc về nhóm nào");
        }

        const currentGroup = await Group.findById(req.user.groupId);

        if (currentGroup.adminId.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, "00104", "Bạn không phải admin, không thể xóa nhóm");
        }

        // Reset groupId cho tất cả thành viên
        await User.updateMany(
            { _id: { $in: currentGroup.members } },
            { $set: { groupId: null } }
        );

        // Xóa nhóm
        await Group.findByIdAndDelete(currentGroup._id);

        return sendResponse(res, 200, "00105", "Xóa nhóm thành công");
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};