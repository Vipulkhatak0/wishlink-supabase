const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');

exports.addComment = asyncHandler(async (req, res) => {
  const { data: wish } = await supabase.from('wishes').select('id,features').eq('slug', req.params.slug).eq('status', 'active').single();
  if (!wish) return res.status(404).json({ success: false, message: 'Wish not found' });
  if (!wish.features?.allowComments) return res.status(403).json({ success: false, message: 'Comments are disabled for this page' });

  const { data: comment, error } = await supabase.from('comments').insert({
    wish_id: wish.id,
    guest_name: req.body.guestName,
    guest_email: req.body.guestEmail || null,
    content: req.body.content,
    emoji: req.body.emoji || '❤️',
    ip: req.ip,
  }).select().single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(201).json({ success: true, comment });
});

exports.getComments = asyncHandler(async (req, res) => {
  const { data: wish } = await supabase.from('wishes').select('id').eq('slug', req.params.slug).single();
  if (!wish) return res.status(404).json({ success: false, message: 'Wish not found' });
  const { data: comments } = await supabase.from('comments')
    .select('*').eq('wish_id', wish.id).eq('is_approved', true).order('created_at', { ascending: false });
  res.status(200).json({ success: true, count: (comments || []).length, comments: comments || [] });
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const { data: comment } = await supabase.from('comments').select('wish_id').eq('id', req.params.id).single();
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
  const { data: wish } = await supabase.from('wishes').select('user_id').eq('id', comment.wish_id).single();
  if (!wish || wish.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
  await supabase.from('comments').delete().eq('id', req.params.id);
  res.status(200).json({ success: true, message: 'Comment deleted' });
});
