const admin = require('firebase-admin');

// Khởi tạo Firebase Admin SDK (chỉ 1 lần)
// Khởi tạo Firebase Admin SDK (chỉ 1 lần)
if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            console.log('✅ Firebase Admin SDK initialized');
        } catch (error) {
            console.error('❌ Firebase initialization error:', error.message);
            // Không throw error để server vẫn chạy được
        }
    } else {
        console.warn('⚠️  Missing FIREBASE_PROJECT_ID in .env, skipping Firebase init.');
    }
}

/**
 * Gửi push notification đến 1 thiết bị
 * @param {string} fcmToken - FCM Token của thiết bị
 * @param {string} title - Tiêu đề thông báo
 * @param {string} body - Nội dung thông báo
 * @param {object} data - Dữ liệu bổ sung (optional)
 */
exports.sendPushNotification = async (fcmToken, title, body, data = {}) => {
    // Kiểm tra token
    if (!fcmToken) {
        console.warn('⚠️  FCM Token is empty, skip sending notification');
        return null;
    }

    try {
        const message = {
            notification: {
                title,
                body
            },
            data, // VD: { groupId: "123", type: "new_member" }
            token: fcmToken
        };

        const response = await admin.messaging().send(message);
        // console.log('✅ Notification sent successfully:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending notification:', error);

        // Nếu token không hợp lệ, có thể xóa khỏi DB
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            console.warn('⚠️  Invalid FCM token, should remove from database');
        }

        throw error;
    }
};

/**
 * Gửi notification đến nhiều người dùng
 * @param {Array} users - Mảng user objects có trường fcmToken
 * @param {string} title - Tiêu đề
 * @param {string} body - Nội dung
 */
exports.sendToMultipleUsers = async (users, title, body) => {
    const validTokens = users
        .map(u => u.fcmToken)
        .filter(token => token && token.length > 0);

    if (validTokens.length === 0) {
        console.warn('⚠️  No valid FCM tokens found');
        return null;
    }

    try {
        const message = {
            notification: { title, body },
            tokens: validTokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        // console.log(`✅ Sent to ${response.successCount}/${validTokens.length} devices`);
        return response;
    } catch (error) {
        console.error('❌ Error sending multicast:', error);
        throw error;
    }
};

/**
 * Gửi notification đến tất cả thành viên của một group
 * @param {string} groupId
 * @param {string} title
 * @param {string} body
 * @param {object} data
 */
exports.sendToGroup = async (groupId, title, body, data = {}) => {
    try {
        const User = require('../models/user');
        const members = await User.find({
            groupId,
            fcmToken: { $exists: true, $ne: '' }
        }).select('fcmToken');

        const tokens = members.map(m => m.fcmToken).filter(Boolean);
        if (tokens.length === 0) {
            console.warn(`⚠️  No FCM tokens found for group ${groupId}`);
            return null;
        }

        const message = {
            notification: { title, body },
            data,
            tokens,
            android: {
                priority: 'high',
                notification: { channelId: 'default-channel-id', sound: 'default', priority: 'high' }
            },
            apns: { payload: { aps: { sound: 'default', badge: 1 } } }
        };

        return await admin.messaging().sendEachForMulticast(message);
    } catch (error) {
        console.error('❌ Error sending group notification:', error);
        throw error;
    }
};