const cron = require('node-cron');
const FridgeItem = require('../models/FridgeItem');
const User = require('../models/user'); 
const notificationService = require('./notification.service');

// Hàm kiểm tra hạn sử dụng
const checkFridgeExpiry = async () => {
    console.log("Running Cron Job: Check Fridge Expiry...");
    
    const today = new Date();
    const twoDaysLater = new Date();
    twoDaysLater.setDate(today.getDate() + 2); // Cộng thêm 2 ngày [cite: 17]

    try {
        // 1. Tìm các item có hạn sử dụng <= 2 ngày tới và chưa bị xóa (nếu có soft delete)
        // Cần populate 'userId' để biết item này của ai
        const expiringItems = await FridgeItem.find({
            expiryDate: { 
                $gte: today, 
                $lte: twoDaysLater 
            }
        }).populate('userId'); 

        // 2. Nhóm các item theo User để không spam thông báo
        // Ví dụ: User A có 3 món sắp hết hạn -> chỉ gửi 1 thông báo
        const userMap = {};

        expiringItems.forEach(item => {
            const user = item.userId;
            if (user && user.fcmTokens && user.fcmTokens.length > 0) {
                if (!userMap[user._id]) {
                    userMap[user._id] = {
                        tokens: user.fcmTokens,
                        items: []
                    };
                }
                userMap[user._id].items.push(item.name);
            }
        });

        // 3. Gửi thông báo cho từng User
        for (const userId in userMap) {
            const data = userMap[userId];
            const itemCount = data.items.length;
            const itemNames = data.items.slice(0, 2).join(', '); // Lấy tên 2 món đầu làm ví dụ
            
            const title = "⚠️ Cảnh báo thực phẩm sắp hết hạn!";
            const body = `Bạn có ${itemCount} món sắp hết hạn (${itemNames}...). Hãy kiểm tra tủ lạnh ngay!`;

            await notificationService.sendToDevice(data.tokens, title, body, { type: 'FRIDGE_EXPIRY' });
        }

    } catch (error) {
        console.error("Cron Job Error:", error);
    }
};

// Khởi chạy Cron Job
const start = () => {
    // Chạy sau mỗi 2 tiếng
    cron.schedule('0 */2 * * *', () => {
        checkFridgeExpiry();
    });
};

module.exports = { start };