const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { data: wishes } = await supabase.from('wishes').select('id,status,visit_count,slug,title').eq('user_id', req.user.id).neq('status', 'deleted');
  const total = wishes?.length || 0;
  const active = wishes?.filter(w => w.status === 'active').length || 0;
  const totalVisits = wishes?.reduce((s, w) => s + (w.visit_count || 0), 0) || 0;
  const top = wishes?.sort((a, b) => b.visit_count - a.visit_count)[0];
  res.status(200).json({ success: true, stats: { totalWishes: total, activeWishes: active, totalVisits, topWish: top ? { slug: top.slug, title: top.title, visits: top.visit_count } : null } });
});

exports.getWishAnalytics = asyncHandler(async (req, res) => {
  const { data: wish } = await supabase.from('wishes').select('visit_count,share_count').eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (!wish) return res.status(404).json({ success: false, message: 'Wish not found' });
  res.status(200).json({ success: true, analytics: { visitCount: wish.visit_count, shareCount: wish.share_count } });
});
