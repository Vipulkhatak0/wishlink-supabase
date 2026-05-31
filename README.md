# 💝 WishLink — Full Stack MERN SaaS (Supabase Edition)

> Create personalized wish websites for birthdays, anniversaries, proposals and more.

## 🛠 Tech Stack

| Layer       | Tech                                        |
|-------------|---------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS + Framer     |
| Backend     | Node.js + Express.js                        |
| Database    | **Supabase (PostgreSQL)**                   |
| Auth        | JWT + Google OAuth                          |
| Storage     | Cloudinary                                  |
| Payments    | Razorpay                                    |
| Deploy      | Vercel (frontend) + Render (backend)        |

---

## 🗄️ Supabase Setup (Do This First!)

### Step 1 — Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, password, and region

### Step 2 — Run the SQL Schema
1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Open `backend/supabase_schema.sql`
3. Paste the **entire file** contents → click **Run**
4. You should see: `Schema created successfully! ✅`

### Step 3 — Get Your API Keys
Go to **Settings → API** and copy:
- `Project URL` → `SUPABASE_URL`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
- `anon` key → `SUPABASE_ANON_KEY`

### Step 4 — Disable RLS (for simplicity, or configure per table)
Since we use the service role key, Row Level Security is bypassed.
For production, enable RLS and add policies per table.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Backend `.env`

Copy `backend/.env.example` → `backend/.env` and fill in:

```env
PORT=5000
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
JWT_SECRET=any_long_random_string_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_test_XXXXXXX
RAZORPAY_KEY_SECRET=...
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@wishlink.com
FROM_NAME=WishLink
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend `.env`

Copy `frontend/.env.example` → `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXX
```

### 4. Run

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📁 Project Structure

```
wishlink/
├── backend/
│   ├── config/
│   │   ├── supabase.js       ← Supabase client
│   │   └── cloudinary.js
│   ├── controllers/          ← Business logic (all use Supabase)
│   ├── middleware/            ← JWT auth, error handler
│   ├── routes/               ← Express routes
│   ├── utils/                ← Email, plan limits
│   ├── supabase_schema.sql   ← ⭐ Run this in Supabase SQL Editor
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        ├── context/           ← Auth context
        ├── pages/             ← All page components
        └── utils/api.js       ← Axios API client
```

---

## 💳 Pricing Plans

| Plan     | Price | Hosting  | Images    | Music | Video | AI |
|----------|-------|----------|-----------|-------|-------|----|
| Free     | ₹0    | –        | 5         | ✗     | ✗     | ✗  |
| Silver   | ₹39   | 30 days  | 20        | ✓     | ✗     | ✗  |
| Gold     | ₹59   | 90 days  | Unlimited | ✓     | ✓     | ✗  |
| Platinum | ₹79   | Forever  | Unlimited | ✓     | ✓     | ✓  |

---

## 🌐 Key API Endpoints

| Method | Endpoint                      | Description         |
|--------|-------------------------------|---------------------|
| POST   | /api/auth/register            | Register            |
| POST   | /api/auth/login               | Login               |
| POST   | /api/auth/google              | Google OAuth        |
| POST   | /api/wishes                   | Create wish         |
| GET    | /api/wishes/my                | My wishes           |
| PUT    | /api/wishes/:id/publish       | Publish             |
| GET    | /api/w/:slug                  | Public wish page    |
| POST   | /api/payments/create-order    | Razorpay order      |
| POST   | /api/payments/verify          | Verify payment      |
| POST   | /api/ai/generate-message      | AI message gen      |
| POST   | /api/upload/image             | Upload image        |

---

## 👑 Make Admin User

In Supabase → **Table Editor** → `users` table → find your user → edit `role` column → set to `admin`.

---

## 🚀 Deployment

### Backend → Render
1. Push to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build: `npm install` | Start: `npm start`
4. Add all env vars from `.env`

### Frontend → Vercel
1. Push frontend to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` = your Render URL
4. Deploy

Built with ❤️ using Node.js + Supabase + React.
