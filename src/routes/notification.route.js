const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// POST /it4788/notification/send
router.post('/send', notificationController.testSendToDevice);

// POST /it4788/notification/chat-test
router.post('/chat-test', notificationController.testSendChat);

module.exports = router;
