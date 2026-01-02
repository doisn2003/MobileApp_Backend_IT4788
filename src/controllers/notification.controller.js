const notificationService = require('../services/notification.service');

const testSendToDevice = async (req, res) => {
    try {
        const { tokens, title, body, data } = req.body;
        await notificationService.sendToDevice(tokens, title, body, data);
        res.status(200).json({ message: "Notification sent (check logs for success/failure)" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const testSendChat = async (req, res) => {
    try {
        const { senderId, groupMembersIds, groupName, messageContent } = req.body;
        await notificationService.sendChatNotification(senderId, groupMembersIds, groupName, messageContent);
        res.status(200).json({ message: "Chat notification process triggered" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    testSendToDevice,
    testSendChat
};
