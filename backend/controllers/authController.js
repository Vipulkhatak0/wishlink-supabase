const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id, user.role);
  const safe = { id:user.id, name:user.name, email:user.email, avatar:user.avatar,
    plan:user.plan, role:user.role, is_email_verified:user.is_email_verified, referral_code:user.referral_code };
  res.status(statusCode).json({ success: true, token, user: safe });
};

const generateReferralCode = () => Math.random().toString(36).substr(2, 8).toUpperCase();

// ── Register ──────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, referralCode } = req.body;

  // Check existing
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(20).toString('hex');
  const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');

  let referredBy = null;
  if (referralCode) {
    const { data: referrer } = await supabase.from('users').select('id,referral_count').eq('referral_code', referralCode).single();
    if (referrer) {
      referredBy = referrer.id;
      await supabase.from('users').update({ referral_count: referrer.referral_count + 1 }).eq('id', referrer.id);
    }
  }

  const { data: user, error } = await supabase.from('users').insert({
    name, email,
    password: hashedPassword,
    referral_code: generateReferralCode(),
    referred_by: referredBy,
    email_verify_token: verifyTokenHash,
    email_verify_expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }).select().single();

  if (error) return res.status(400).json({ success: false, message: error.message });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({ email, subject: 'Verify your WishLink account',
      html: `<p>Hi ${name}! Click <a href="${verifyUrl}">here</a> to verify your email.</p>` });
  } catch (e) { console.error('Verify email error:', e.message); }

  sendTokenResponse(user, 201, res);
});

// ── Login ─────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });

  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);
  sendTokenResponse(user, 200, res);
});

// ── Google Login ──────────────────────────────────────────────
exports.googleLogin = asyncHandler(async (req, res) => {
  const { tokenId } = req.body;
  const ticket = await client.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });
  const { name, email, picture, sub } = ticket.getPayload();

  let { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  if (!user) {
    const { data: newUser, error } = await supabase.from('users').insert({
      name, email, google_id: sub, avatar: picture,
      is_email_verified: true, referral_code: generateReferralCode(),
    }).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    user = newUser;
  } else if (!user.google_id) {
    await supabase.from('users').update({ google_id: sub, avatar: picture || user.avatar }).eq('id', user.id);
  }
  await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);
  sendTokenResponse(user, 200, res);
});

// ── Get Me ────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password, ...safe } = user;
  res.status(200).json({ success: true, user: safe });
});

// ── Forgot Password ───────────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('id,email,name').eq('email', req.body.email).single();
  if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  await supabase.from('users').update({
    reset_password_token: resetTokenHash,
    reset_password_expire: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }).eq('id', user.id);

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({ email: user.email, subject: 'Password Reset – WishLink',
    html: `<p>Hi ${user.name}! Reset your password: <a href="${resetUrl}">${resetUrl}</a><br>This link expires in 10 minutes.</p>` });

  res.status(200).json({ success: true, message: 'Reset email sent' });
});

// ── Reset Password ────────────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const { data: user } = await supabase.from('users')
    .select('id').eq('reset_password_token', tokenHash)
    .gt('reset_password_expire', new Date().toISOString()).single();

  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

  const hashed = await bcrypt.hash(req.body.password, 12);
  const { data: updated } = await supabase.from('users').update({
    password: hashed,
    reset_password_token: null,
    reset_password_expire: null,
  }).eq('id', user.id).select().single();

  sendTokenResponse(updated, 200, res);
});

// ── Verify Email ──────────────────────────────────────────────
exports.verifyEmail = asyncHandler(async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const { data: user } = await supabase.from('users')
    .select('id').eq('email_verify_token', tokenHash)
    .gt('email_verify_expire', new Date().toISOString()).single();

  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

  await supabase.from('users').update({
    is_email_verified: true, email_verify_token: null, email_verify_expire: null,
  }).eq('id', user.id);

  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

// ── Update Profile ────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const { data: user, error } = await supabase.from('users')
    .update({ name, avatar }).eq('id', req.user.id).select().single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  const { password, ...safe } = user;
  res.status(200).json({ success: true, user: safe });
});

// ── Update Password ───────────────────────────────────────────
exports.updatePassword = asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password incorrect' });
  const hashed = await bcrypt.hash(req.body.newPassword, 12);
  const { data: updated } = await supabase.from('users').update({ password: hashed }).eq('id', user.id).select().single();
  sendTokenResponse(updated, 200, res);
});
