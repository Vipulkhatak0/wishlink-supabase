-- ============================================================
-- WishLink Supabase Schema
-- Run this entire file in Supabase → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  password        TEXT,
  avatar          TEXT DEFAULT '',
  google_id       TEXT,
  role            TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
  plan            TEXT DEFAULT 'free' CHECK (plan IN ('free','silver','gold','platinum')),
  plan_expires_at TIMESTAMPTZ,
  is_email_verified BOOLEAN DEFAULT FALSE,
  email_verify_token TEXT,
  email_verify_expire TIMESTAMPTZ,
  reset_password_token TEXT,
  reset_password_expire TIMESTAMPTZ,
  referral_code   TEXT UNIQUE,
  referred_by     UUID REFERENCES users(id),
  referral_count  INT DEFAULT 0,
  wish_count      INT DEFAULT 0,
  total_visitors  INT DEFAULT 0,
  last_login      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TEMPLATES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE,
  occasion    TEXT,
  description TEXT,
  thumbnail   TEXT,
  preview_url TEXT,
  theme       JSONB DEFAULT '{}',
  features    JSONB DEFAULT '{}',
  plan        TEXT DEFAULT 'free',
  is_active   BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  emoji       TEXT,
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- WISHES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug                TEXT UNIQUE NOT NULL,
  title               TEXT,
  sender_name         TEXT NOT NULL,
  receiver_name       TEXT NOT NULL,
  relationship        TEXT NOT NULL,
  occasion            TEXT NOT NULL,
  custom_occasion     TEXT,
  template_id         UUID REFERENCES templates(id),
  theme               JSONB DEFAULT '{"primaryColor":"#FF4D6D","secondaryColor":"#6B2D8B","fontFamily":"Playfair Display","backgroundStyle":"gradient"}',
  message             TEXT,
  ai_generated_message TEXT,
  images              JSONB DEFAULT '[]',
  videos              JSONB DEFAULT '[]',
  music               JSONB,
  timeline            JSONB DEFAULT '[]',
  secret_message      JSONB,
  gift_reveal         JSONB,
  countdown_to        TIMESTAMPTZ,
  features            JSONB DEFAULT '{"showConfetti":true,"showFireworks":false,"showHeartRain":false,"showCakeAnimation":false,"allowComments":true,"allowReactions":true,"showVisitorCount":true,"showQRCode":true,"allowPDFDownload":false}',
  plan                TEXT DEFAULT 'free',
  status              TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','expired','deleted')),
  is_public           BOOLEAN DEFAULT TRUE,
  has_watermark       BOOLEAN DEFAULT TRUE,
  expires_at          TIMESTAMPTZ,
  visit_count         INT DEFAULT 0,
  unique_visitors     INT DEFAULT 0,
  share_count         INT DEFAULT 0,
  language            TEXT DEFAULT 'english',
  meta_title          TEXT,
  meta_description    TEXT,
  qr_code             TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishes_slug ON wishes(slug);
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
CREATE INDEX IF NOT EXISTS idx_wishes_occasion ON wishes(occasion);

-- ─────────────────────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wish_id              UUID REFERENCES wishes(id),
  razorpay_order_id    TEXT NOT NULL,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  plan                 TEXT NOT NULL,
  amount               INT NOT NULL,
  currency             TEXT DEFAULT 'INR',
  status               TEXT DEFAULT 'created' CHECK (status IN ('created','paid','failed','refunded')),
  coupon_code          TEXT,
  discount             INT DEFAULT 0,
  receipt              TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wish_id     UUID NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  guest_name  TEXT NOT NULL,
  guest_email TEXT,
  content     TEXT NOT NULL,
  emoji       TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  ip          TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_wish_id ON comments(wish_id);

-- ─────────────────────────────────────────────────────────────
-- ANALYTICS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wish_id         UUID NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  date            DATE DEFAULT CURRENT_DATE,
  visits          INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  shares          INT DEFAULT 0,
  comments        INT DEFAULT 0,
  reactions       INT DEFAULT 0,
  device          JSONB DEFAULT '{}',
  country         JSONB DEFAULT '{}',
  referrer        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  name        TEXT,
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  occasion    TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type      TEXT,
  title     TEXT,
  message   TEXT,
  link      TEXT,
  is_read   BOOLEAN DEFAULT FALSE,
  wish_id   UUID REFERENCES wishes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- updated_at auto-trigger
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY['users','wishes','payments','templates']) LOOP
  EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON %I; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t, t);
END LOOP; END $$;

-- ─────────────────────────────────────────────────────────────
-- Seed default templates
-- ─────────────────────────────────────────────────────────────
INSERT INTO templates (name, slug, occasion, description, emoji, plan, theme, features) VALUES
('Romantic Proposal',   'romantic-proposal',  'proposal',   'Perfect for the most important question', '💍', 'free',   '{"primaryColor":"#FF4D6D","secondaryColor":"#C2185B","gradientColors":["#FF4D6D","#C2185B"]}', '{"hasAnimation":true,"hasMusic":true}'),
('Birthday Party',      'birthday-party',     'birthday',   'Celebrate their special day with joy',    '🎂', 'free',   '{"primaryColor":"#F7B731","secondaryColor":"#FF6B6B","gradientColors":["#F7B731","#FF6B6B"]}', '{"hasAnimation":true,"hasMusic":true}'),
('Anniversary',         'anniversary',        'anniversary','Relive every beautiful memory',           '💑', 'silver', '{"primaryColor":"#6B2D8B","secondaryColor":"#C2185B","gradientColors":["#6B2D8B","#C2185B"]}', '{"hasAnimation":true,"hasTimeline":true}'),
('Mother Love',         'mother-love',        'mother',     'Show mom how much she means to you',      '👩‍👧', 'silver', '{"primaryColor":"#E91E63","secondaryColor":"#FF80AB","gradientColors":["#E91E63","#FF80AB"]}', '{"hasAnimation":true}'),
('Father Hero',         'father-hero',        'father',     'Celebrate the strongest person you know', '👨‍👦', 'free',   '{"primaryColor":"#1565C0","secondaryColor":"#42A5F5","gradientColors":["#1565C0","#42A5F5"]}', '{"hasAnimation":true}'),
('Friendship Forever',  'friendship-forever', 'friendship', 'Celebrate the bond that never breaks',    '🤝', 'free',   '{"primaryColor":"#2E7D32","secondaryColor":"#81C784","gradientColors":["#2E7D32","#81C784"]}', '{"hasAnimation":true}'),
('Festival Wishes',     'festival-wishes',    'festival',   'Diwali, Eid, Christmas — festive cheer',  '🪔', 'gold',   '{"primaryColor":"#FF6F00","secondaryColor":"#FFB300","gradientColors":["#FF6F00","#FFB300"]}', '{"hasAnimation":true,"hasMusic":true}'),
('Graduation Glory',    'graduation-glory',   'graduation', 'Celebrate the hard work that paid off',   '🎓', 'gold',   '{"primaryColor":"#4527A0","secondaryColor":"#7C4DFF","gradientColors":["#4527A0","#7C4DFF"]}', '{"hasAnimation":true}')
ON CONFLICT (slug) DO NOTHING;

SELECT 'Schema created successfully! ✅' AS status;
