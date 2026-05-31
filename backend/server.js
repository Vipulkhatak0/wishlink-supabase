const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

// ── Validate required env vars ─────────────────────────────────
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('\n❌ Missing required environment variables:');
  missing.forEach(k => console.error(`   - ${k}`));
  console.error('\n👉 Copy backend/.env.example to backend/.env and fill in the values.\n');
  process.exit(1);
}

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  // Allow ALL vercel preview deployments automatically
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain + localhost + exact FRONTEND_URL
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests.' }));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/wishes',    require('./routes/wishes'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/upload',    require('./routes/upload'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/w',         require('./routes/publicWish'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', db: 'Supabase', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use(require('./middleware/errorHandler'));

// Cron: expire wishes daily
cron.schedule('0 0 * * *', async () => {
  try {
    const supabase = require('./config/supabase');
    await supabase.from('wishes').update({ status: 'expired' })
      .eq('status', 'active').lt('expires_at', new Date().toISOString()).not('expires_at', 'is', null);
    console.log('[cron] Expired wishes updated');
  } catch (e) { console.error('[cron] Error:', e.message); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('  💝 WishLink backend is running!');
  console.log(`  🌐 URL    : http://localhost:${PORT}`);
  console.log(`  🗄️  DB     : Supabase`);
  console.log(`  ✅ CORS   : ${allowedOrigins.join(', ')}`);
  console.log(`  🔗 Health : http://localhost:${PORT}/api/health`);
  console.log('');
});

module.exports = app;