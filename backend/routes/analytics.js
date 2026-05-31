const express = require('express');
const router = express.Router();
const { getDashboardStats, getWishAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/wish/:id', protect, getWishAnalytics);

module.exports = router;
