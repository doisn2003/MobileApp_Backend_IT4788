const socketIo = require('socket.io');
const Message = require('./models/message');
const User = require('./models/user');
const notificationService = require('./services/notification.service');

let io;

exports.init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all for mobile app
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join group room
        socket.on('join_group', (groupId) => {
            socket.join(groupId);
            console.log(`Socket ${socket.id} joined group ${groupId}`);
        });

        // Leave group room
        socket.on('leave_group', (groupId) => {
            socket.leave(groupId);
            console.log(`Socket ${socket.id} left group ${groupId}`);
        });

        // Send message
        socket.on('send_message', async (data) => {
            // data: { groupId, senderId, content, tempId }
            try {
                const { groupId, senderId, content, tempId } = data;

                // 1. Save to DB
                const newMessage = new Message({
                    groupId,
                    senderId,
                    content,
                    tempId
                });
                await newMessage.save();

                // Populate sender info for frontend
                await newMessage.populate('senderId', 'name avatar');

                // 2. Emit to room
                io.to(groupId).emit('new_message', newMessage);

                // 3. Send Push Notification to other members
                // Get sender info
                const sender = await User.findById(senderId);
                const senderName = sender ? sender.name : 'Thành viên nhóm';

                // Send to group (excluding sender ideally, but service handles logic check?)
                // The current service sends to ALL members of group. 
                // Optimization: Maybe update service to exclude sender, but for now use existing.
                await notificationService.sendToGroupExceptOnes(
                    groupId,
                    [sender],
                    `Tin nhắn mới từ ${senderName}`,
                    content,
                    { type: 'chat', groupId: groupId, messageId: newMessage._id.toString() }
                );

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Message sending failed');
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

exports.getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
