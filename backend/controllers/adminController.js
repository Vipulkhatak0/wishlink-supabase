const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    { count: totalUsers },
    { count: totalWishes },
    { count: activeWishes },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('wishes').select('*', { count: 'exact', head: true }),
    supabase.from('wishes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('payments').select('amount').eq('status', 'paid'),
  ]);
  const totalRevenue = (revenueData || []).reduce((s, p) => s + p.amount, 0);
  res.status(200).json({ success: true, stats: { totalUsers, totalWishes, activeWishes, totalRevenue } });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const { data: users } = await supabase.from('users').select('id,name,email,plan,role,wish_count,is_active,created_at').order('created_at', { ascending: false }).limit(100);
  res.status(200).json({ success: true, users: users || [] });
});

exports.getPayments = asyncHandler(async (req, res) => {
  const { data: payments } = await supabase.from('payments').select('*,users(name,email)').eq('status', 'paid').order('created_at', { ascending: false }).limit(100);
  res.status(200).json({ success: true, payments: payments || [] });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('is_active').eq('id', req.params.id).single();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { data: updated } = await supabase.from('users').update({ is_active: !user.is_active }).eq('id', req.params.id).select('id,name,email,plan,is_active').single();
  res.status(200).json({ success: true, user: updated });
});
