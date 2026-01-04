const Group = require('../models/group');
const User = require('../models/user');
const sendResponse = require('../utils/responseHelper');
const notificationService = require('../services/notification.service');
const Message = require('../models/message');

// 1. Tạo nhóm (Create Group)
exports.createGroup = async (req, res) => {
    try {
        const userId = req.user._id;

        if (req.user.groupId) {
            return sendResponse(res, 400, "00093", "Không thể tạo nhóm, bạn đã thuộc về một nhóm rồi");
        }

        const newGroup = new Group({
            name: `Gia đình của ${req.user.name}`,
            adminId: userId,
            members: [userId]
        });
        await newGroup.save();

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
        const { username } = req.body;

        if (!username) {
            return sendResponse(res, 400, "00100", "Thiếu username");
        }

        if (!req.user.groupId) {
            return sendResponse(res, 400, "00096", "Bạn không thuộc về nhóm nào");
        }

        const currentGroup = await Group.findById(req.user.groupId);

        if (currentGroup.adminId.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, "00104", "Bạn không phải admin, không thể thêm/xóa");
        }

        const memberToAdd = await User.findOne({ username });
        if (!memberToAdd) {
            return sendResponse(res, 404, "00099 X", "Không tồn tại user này");
        }

        if (memberToAdd.groupId) {
            return sendResponse(res, 400, "00099", "Người này đã thuộc về một nhóm");
        }

        currentGroup.members.push(memberToAdd._id);
        await currentGroup.save();

        memberToAdd.groupId = currentGroup._id;
        await memberToAdd.save();

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

        if (memberId === req.user._id.toString()) {
            return sendResponse(res, 400, "00105", "Không thể xóa admin khỏi nhóm. Hãy dùng chức năng xóa nhóm nếu muốn giải tán.");
        }

        if (!currentGroup.members.includes(memberId)) {
            return sendResponse(res, 404, "00099", "Thành viên không tồn tại trong nhóm này");
        }

        currentGroup.members = currentGroup.members.filter(id => id.toString() !== memberId);
        await currentGroup.save();

        const memberUser = await User.findById(memberId);
        if (memberUser) {
            memberUser.groupId = null;
            await memberUser.save();
        }

        if (memberUser && memberUser.fcmToken) {
            try {
                await notificationService.sendPushNotification(
                    memberUser.fcmToken,
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

        await User.updateMany(
            { _id: { $in: currentGroup.members } },
            { $set: { groupId: null } }
        );

        await Group.findByIdAndDelete(currentGroup._id);

        return sendResponse(res, 200, "00105", "Xóa nhóm thành công");
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 6. Lấy tin nhắn nhóm
exports.getGroupMessages = async (req, res) => {
    try {
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00096", "Bạn không thuộc về nhóm nào");
        }

        const messages = await Message.find({ groupId: req.user.groupId })
            .sort({ createdAt: 1 })
            .populate('senderId', 'name avatar');

        return sendResponse(res, 200, "00106", "Lấy tin nhắn thành công", messages);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};

// 7. Lấy thông tin nhóm (để biết groupId)
exports.getGroupInfo = async (req, res) => {
    try {
        if (!req.user.groupId) {
            return sendResponse(res, 400, "00096", "Bạn không thuộc về nhóm nào");
        }

        const group = await Group.findById(req.user.groupId).populate('members', 'id username name email avatar');

        return sendResponse(res, 200, "00097", "Thành công", group);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "00008", "Lỗi server");
    }
};