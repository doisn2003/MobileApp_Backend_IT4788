const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Tất cả các routes ở đây đều cần đăng nhập
router.use(authMiddleware);

// POST /user/group/ -> Tạo nhóm
router.post('/', groupController.createGroup);

// POST /user/group/add/ -> Thêm thành viên
router.post('/add', groupController.addMember);

// GET /user/group/ -> Lấy danh sách thành viên
router.get('/', groupController.getGroupMembers);

// POST /user/group/remove -> Xóa thành viên
router.post('/remove', groupController.removeMember);

// DELETE /user/group/ -> Xóa nhóm
router.delete('/', groupController.deleteGroup);

// GET /user/group/messages -> Lấy tin nhắn nhóm
router.get('/messages', groupController.getGroupMessages);

// GET /user/group/info -> Lấy thông tin nhóm
router.get('/info', groupController.getGroupInfo);

module.exports = router;