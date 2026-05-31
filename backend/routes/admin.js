const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, getPayments, toggleUserStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/payments', getPayments);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
