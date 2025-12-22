# Setup Guide

**Personal Development System - Supabase + PostgreSQL**

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (free)
3. Sign in with GitHub
4. Click **"New project"**
5. Name: `sudo-me`
6. Set a database password (save this!)
7. Select region closest to you
8. Click **"Create new project"**
9. Wait ~2 minutes for setup

### Step 2: Get Your Credentials

1. In Supabase dashboard, go to **Settings → API**
2. Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy the **anon public** key (long string starting with `eyJ...`)

### Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase/migrations/001_initial_schema.sql` from this project
4. Copy the entire file contents
5. Paste into the SQL editor
6. Click **"Run"** (or Cmd/Ctrl + Enter)
7. Verify success (green checkmark)

### Step 4: Create .env.local File

Create a file named `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: LLM (Gemini)
GEMINI_API_KEY=your_gemini_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Step 6: Test It!

1. Open http://localhost:3000
2. Click **Sign Up**
3. Create an account
4. You should see the dashboard!

---

## 📋 What You Get

### Database Tables (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles & settings |
| `daily_logs` | Daily habit tracking |
| `transactions` | Finance tracking |
| `goals` | Short/mid/long-term goals |
| `budgets` | Monthly budgets |
| `investment_portfolio` | Investment tracking |
| `workouts` | Detailed workout logs |
| `weekly_scorecards` | Weekly progress |
| `notifications` | Coaching tips & alerts |

### Features

- ✅ User authentication (email/password)
- ✅ Daily habit tracking
- ✅ Finance management (budget tracking)
- ✅ Goal setting (short/mid/long-term)
- ✅ Discipline score calculation
- ✅ Weekly scorecards
- ✅ Investment portfolio tracking
- ✅ Real-time data updates

---

## 🔒 Security

Row Level Security (RLS) is enabled:
- Users can only access their own data
- All queries are automatically filtered by user ID
- No cross-user data access possible

---

## 🆚 Why Supabase + PostgreSQL?

| Feature | Benefit |
|---------|---------|
| **Free tier** | 500MB database, 50K monthly active users |
| **PostgreSQL** | Industry-standard, relational, ACID compliant |
| **Built-in Auth** | Email/password, OAuth, Magic links |
| **Real-time** | Live updates without polling |
| **Row Level Security** | Data isolation built-in |
| **Open Source** | No vendor lock-in |
| **SQL Editor** | Run queries directly in browser |

---

## 🐛 Troubleshooting

### "Database Not Configured"

1. Make sure `.env.local` exists in project root
2. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
3. Restart the dev server after creating `.env.local`

### "Invalid API Key"

1. Go to Supabase → Settings → API
2. Copy the **anon public** key (not service_role!)
3. Update `.env.local`

### "Table doesn't exist"

1. Run the migration SQL in Supabase SQL Editor
2. Check for any errors in the SQL output

### "Permission denied"

1. RLS policies might not be applied
2. Re-run the migration SQL
3. Make sure you're logged in

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Ready to transform? Start your 90-day journey!** 🚀




