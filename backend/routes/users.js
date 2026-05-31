const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('id,name,email,avatar,plan,role,wish_count,referral_code,referral_count,is_email_verified,created_at').eq('id', req.user.id).single();
  res.status(200).json({ success: true, user });
}));

module.exports = router;
