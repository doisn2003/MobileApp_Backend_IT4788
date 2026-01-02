const admin = require("../configs/firebase");
const User = require("../models/user");

/**
 * Hàm gửi thông báo đến một danh sách các token
 * @param {Array} tokens - Mảng các FCM token
 * @param {String} title - Tiêu đề thông báo
 * @param {String} body - Nội dung thông báo
 * @param {Object} data - Dữ liệu kèm theo (ví dụ: messageId, type)
 */
const sendToDevice = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: data, // Dùng để FE điều hướng khi bấm vào thông báo
    tokens: tokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log("Success count:", response.successCount);
    
    // Xử lý các token bị lỗi (ví dụ: user đã gỡ app)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      console.log('List of tokens that caused failures: ' + failedTokens);
      // TODO: Có thể viết logic xóa các token chết này khỏi DB User
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

/**
 * Hàm chuẩn bị cho tính năng CHAT sau này
 * Gửi thông báo tin nhắn mới đến các thành viên nhóm (trừ người gửi)
 */
const sendChatNotification = async (senderId, groupMembersIds, groupName, messageContent) => {
    try {
        // 1. Lọc ra danh sách người nhận (trừ người gửi)
        const receiverIds = groupMembersIds.filter(id => id.toString() !== senderId.toString());

        // 2. Tìm User trong DB để lấy fcmTokens
        const receivers = await User.find({ _id: { $in: receiverIds } });

        // 3. Gom tất cả token lại thành 1 mảng
        let allTokens = [];
        receivers.forEach(user => {
            if (user.fcmTokens && user.fcmTokens.length > 0) {
                allTokens = [...allTokens, ...user.fcmTokens];
            }
        });

        // 4. Gửi thông báo
        if (allTokens.length > 0) {
            await sendToDevice(
                allTokens, 
                `Tin nhắn mới từ ${groupName}`, 
                messageContent, 
                { type: 'CHAT_NEW_MESSAGE', groupId: '...' } // Data để FE mở màn hình Chat
            );
        }
    } catch (error) {
        console.error("Chat Notification Error:", error);
    }
};

module.exports = {
  sendToDevice,
  sendChatNotification
};