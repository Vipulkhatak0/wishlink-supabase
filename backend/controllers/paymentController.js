const crypto = require('crypto');
const supabase = require('../config/supabase');
const asyncHandler = require('../middleware/async');
const { PLAN_PRICES, PLAN_LIMITS } = require('../utils/planLimits');
const sendEmail = require('../utils/sendEmail');

const getRazorpay = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

exports.createOrder = asyncHandler(async (req, res) => {
  const { plan, wishId } = req.body;
  if (!PLAN_PRICES[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });
  const amount = PLAN_PRICES[plan];
  const receipt = `rcpt_${req.user.id.toString().slice(-6)}_${Date.now()}`;
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({ amount, currency: 'INR', receipt });

  const { data: payment, error } = await supabase.from('payments').insert({
    user_id: req.user.id,
    wish_id: wishId || null,
    razorpay_order_id: order.id,
    plan, amount, receipt,
  }).select().single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(200).json({ success: true, orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, paymentId: payment.id });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
  if (expectedSig !== razorpaySignature)
    return res.status(400).json({ success: false, message: 'Payment verification failed' });

  const { data: payment } = await supabase.from('payments').select('*').eq('id', paymentId).single();
  if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

  await supabase.from('payments').update({
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    status: 'paid',
  }).eq('id', paymentId);

  const limits = PLAN_LIMITS[payment.plan];
  const planExpiresAt = limits.hostingDays === -1 || limits.hostingDays === null ? null
    : new Date(Date.now() + limits.hostingDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: user } = await supabase.from('users')
    .update({ plan: payment.plan, plan_expires_at: planExpiresAt }).eq('id', req.user.id).select().single();

  if (payment.wish_id) {
    await supabase.from('wishes').update({ plan: payment.plan, has_watermark: limits.hasWatermark, expires_at: planExpiresAt }).eq('id', payment.wish_id);
  }

  try {
    await sendEmail({ email: user.email, subject: `🎉 WishLink ${payment.plan} Plan Activated!`,
      html: `<h2>Thank you for upgrading to ${payment.plan}!</h2><p>Your plan is now active. Go create something beautiful. 💝</p>` });
  } catch (e) { console.error('Email error:', e.message); }

  const { password, ...safeUser } = user;
  res.status(200).json({ success: true, message: 'Payment verified', user: safeUser });
});

exports.getMyPayments = asyncHandler(async (req, res) => {
  const { data: payments } = await supabase.from('payments').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
  res.status(200).json({ success: true, payments: payments || [] });
});
