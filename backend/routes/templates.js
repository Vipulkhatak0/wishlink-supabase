const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');

router.get('/', asyncHandler(async (req, res) => {
  const { data: templates } = await supabase.from('templates').select('*').eq('is_active', true).order('usage_count', { ascending: false });
  res.status(200).json({ success: true, templates: templates || [] });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data: template } = await supabase.from('templates').select('*').eq('id', req.params.id).single();
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
  res.status(200).json({ success: true, template });
}));

module.exports = router;
