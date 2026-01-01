const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Bảo vệ tất cả các route này bằng Token
router.use(authMiddleware);

// --- CATEGORY ---
// POST /admin/category/
router.post('/category', adminController.createCategory);
// GET /admin/category/
router.get('/category', adminController.getCategories);
// PUT /admin/category/
router.put('/category', adminController.updateCategory);
// DELETE /admin/category/
router.delete('/category', adminController.deleteCategory);

// --- UNIT ---
// POST /admin/unit/
router.post('/unit', adminController.createUnit);
// GET /admin/unit/
router.get('/unit', adminController.getUnits);
// PUT /admin/unit/
router.put('/unit', adminController.updateUnit);
// DELETE /admin/unit/
router.delete('/unit', adminController.deleteUnit);

// --- LOGS ---
// GET /admin/logs/
router.get('/logs', adminController.getLogs);

module.exports = router;