const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');
const QRCode = require('qrcode');
const { PLAN_LIMITS } = require('../utils/planLimits');

// helper: build unique slug
const buildSlug = async (receiverName, occasion) => {
  const base = `${receiverName}-${occasion}`.toLowerCase()
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let slug = base, count = 1;
  while (true) {
    const { data } = await supabase.from('wishes').select('id').eq('slug', slug).single();
    if (!data) break;
    slug = `${base}-${count++}`;
  }
  return slug;
};

// ── Create Wish ────────────────────────────────────────────────
exports.createWish = asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  const limits = PLAN_LIMITS[user.plan];

  if (limits.maxWishes !== -1 && user.wish_count >= limits.maxWishes)
    return res.status(403).json({ success: false, message: `Your ${user.plan} plan allows only ${limits.maxWishes} wish page(s). Upgrade to create more.` });

  const { receiverName, occasion, senderName, slug: customSlug } = req.body;
  const slug = customSlug || await buildSlug(receiverName, occasion);

  const { data: existing } = await supabase.from('wishes').select('id').eq('slug', slug).single();
  if (existing) return res.status(400).json({ success: false, message: 'This URL is already taken.' });

  const expiresAt = limits.hostingDays === null ? null
    : limits.hostingDays === -1 ? null
    : new Date(Date.now() + limits.hostingDays * 24 * 60 * 60 * 1000).toISOString();

  const wishUrl = `${process.env.FRONTEND_URL}/w/${slug}`;
  const qrCode = await QRCode.toDataURL(wishUrl);

  const insertData = {
    user_id:        req.user.id,
    slug,
    title:          req.body.title || `${receiverName}'s ${occasion}`,
    sender_name:    senderName,
    receiver_name:  receiverName,
    relationship:   req.body.relationship,
    occasion,
    custom_occasion: req.body.customOccasion || null,
    template_id:    req.body.template || null,
    theme:          req.body.theme || {},
    message:        req.body.message || null,
    images:         req.body.images || [],
    videos:         req.body.videos || [],
    music:          req.body.music || null,
    timeline:       req.body.timeline || [],
    secret_message: req.body.secretMessage || null,
    features:       { ...(req.body.features || {}), allowComments: limits.hasComments, allowPDFDownload: limits.hasPDF },
    plan:           user.plan,
    status:         req.body.status || 'draft',
    has_watermark:  limits.hasWatermark,
    expires_at:     expiresAt,
    language:       req.body.language || 'english',
    countdown_to:   req.body.countdownTo || null,
    qr_code:        qrCode,
  };

  const { data: wish, error } = await supabase.from('wishes').insert(insertData).select().single();
  if (error) return res.status(400).json({ success: false, message: error.message });

  await supabase.from('users').update({ wish_count: user.wish_count + 1 }).eq('id', user.id);

  res.status(201).json({ success: true, wish });
});

// ── My Wishes ─────────────────────────────────────────────────
exports.getMyWishes = asyncHandler(async (req, res) => {
  const { data: wishes, error } = await supabase.from('wishes')
    .select('id,slug,title,receiver_name,occasion,status,visit_count,created_at,expires_at,plan')
    .eq('user_id', req.user.id).neq('status', 'deleted').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(200).json({ success: true, count: wishes.length, wishes });
});

// ── Get Single Wish (owner) ────────────────────────────────────
exports.getWish = asyncHandler(async (req, res) => {
  const { data: wish, error } = await supabase.from('wishes')
    .select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (!wish) return res.status(404).json({ success: false, message: 'Wish not found' });
  res.status(200).json({ success: true, wish });
});

// ── Update Wish ────────────────────────────────────────────────
exports.updateWish = asyncHandler(async (req, res) => {
  const { data: existing } = await supabase.from('wishes').select('id').eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (!existing) return res.status(404).json({ success: false, message: 'Wish not found' });

  const allowed = ['title','message','theme','images','videos','music','timeline','features','countdown_to','language','secret_message','gift_reveal','is_public'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  // camelCase → snake_case mapping
  if (req.body.countdownTo !== undefined) updates.countdown_to = req.body.countdownTo;
  if (req.body.secretMessage !== undefined) updates.secret_message = req.body.secretMessage;
  if (req.body.giftReveal !== undefined) updates.gift_reveal = req.body.giftReveal;

  const { data: wish, error } = await supabase.from('wishes').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(200).json({ success: true, wish });
});

// ── Delete Wish ────────────────────────────────────────────────
exports.deleteWish = asyncHandler(async (req, res) => {
  const { data: wish } = await supabase.from('wishes').select('id').eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (!wish) return res.status(404).json({ success: false, message: 'Wish not found' });
  await supabase.from('wishes').update({ status: 'deleted' }).eq('id', req.params.id);
  const { data: user } = await supabase.from('users').select('wish_count').eq('id', req.user.id).single();
  await supabase.from('users').update({ wish_count: Math.max(0, user.wish_count - 1) }).eq('id', req.user.id);
  res.status(200).json({ success: true, message: 'Wish deleted' });
});

// ── Publish Wish ───────────────────────────────────────────────
exports.publishWish = asyncHandler(async (req, res) => {
  const { data: wish } = await supabase.from('wishes').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (!wish) return res.status(404).json({ success: false, message: 'Wish not found' });
  const { data: updated } = await supabase.from('wishes').update({ status: 'active' }).eq('id', req.params.id).select().single();
  res.status(200).json({ success: true, wish: updated, url: `${process.env.FRONTEND_URL}/w/${wish.slug}` });
});

// ── Public Wish Page ───────────────────────────────────────────
exports.getPublicWish = asyncHandler(async (req, res) => {
  const { data: wish } = await supabase.from('wishes').select('*').eq('slug', req.params.slug).eq('status', 'active').single();
  if (!wish) return res.status(404).json({ success: false, message: 'Wish page not found or expired' });
  await supabase.from('wishes').update({ visit_count: wish.visit_count + 1 }).eq('id', wish.id);
  res.status(200).json({ success: true, wish: { ...wish, visit_count: wish.visit_count + 1 } });
});

// ── Trending ───────────────────────────────────────────────────
exports.getTrending = asyncHandler(async (req, res) => {
  const { data: wishes } = await supabase.from('wishes')
    .select('id,slug,title,receiver_name,occasion,visit_count')
    .eq('status', 'active').eq('is_public', true)
    .order('visit_count', { ascending: false }).limit(12);
  res.status(200).json({ success: true, wishes: wishes || [] });
});

// ── Unlock Secret ──────────────────────────────────────────────
exports.unlockSecret = asyncHandler(async (req, res) => {
  const { data: wish } = await supabase.from('wishes').select('secret_message').eq('slug', req.params.slug).single();
  if (!wish || !wish.secret_message) return res.status(404).json({ success: false, message: 'No secret message' });
  if (wish.secret_message.password !== req.body.password)
    return res.status(401).json({ success: false, message: 'Wrong password' });
  res.status(200).json({ success: true, message: wish.secret_message.content });
});
