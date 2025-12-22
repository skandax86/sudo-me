# sudo-me

> **Personal Development System** - A modular, scalable application to track your transformation journey across Health, Finance, Career, Discipline, Learning, and Personal Growth.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

📖 **Full Setup Guide:** [docs/SETUP-GUIDE.md](./docs/SETUP-GUIDE.md)

---

## 🎯 Features

### Multi-Domain Dashboard
- **Home Dashboard** - Consolidated view of all your focus areas
- **Domain Dashboards** - Deep-dive into Health, Finance, Career, Discipline, Learning, Personal
- **Persistent Sidebar** - Dynamic navigation based on your selections
- **Mobile Responsive** - Works on all devices

### Core Modules
| Domain | Features |
|--------|----------|
| 💪 **Health** | Workouts, water intake, sleep tracking |
| 💰 **Finance** | Budget tracking, investments, transactions |
| 💼 **Career** | Goals, certifications, skill tracking |
| 🎯 **Discipline** | Habits, routines, streaks |
| 📚 **Learning** | LeetCode, study hours, books |
| ✨ **Personal** | Journal, mood, gratitude |

### Personalized Onboarding
- 9-step onboarding flow
- AI-generated personalized plan
- Focus area selection
- Custom goal setting

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Supabase (Auth, PostgreSQL) |
| **AI/LLM** | Google Gemini Flash |
| **Hosting** | Vercel |

---

## 📁 Project Structure

```
sudo-me/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard pages (home, domains, settings)
│   ├── onboarding/         # Onboarding flow
│   ├── auth/               # Authentication pages
│   └── api/                # API routes
├── components/             # React components
│   └── dashboard/          # Dashboard components (layout, widgets, cards)
├── lib/                    # Core libraries
│   ├── domains/            # Domain registry & configuration
│   ├── hooks/              # React hooks (useUser, etc.)
│   ├── supabase/           # Supabase client
│   └── analytics/          # Analytics hooks
├── types/                  # TypeScript types
├── supabase/               # Database migrations
├── tests/                  # Jest & Playwright tests
└── docs/                   # Documentation
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](./docs/SETUP-GUIDE.md) | Supabase setup & environment config |
| [Testing Guide](./docs/TESTING.md) | Jest, Playwright, CI/CD |
| [Docker Guide](./docs/DOCKER-GUIDE.md) | Containerization & deployment |
| [LLM Cost Guide](./docs/llm-cost-optimization.md) | Cost-optimized AI setup |
| [Enterprise Standards](./docs/ENTERPRISE-STANDARDS.md) | Quality checklist |
| [90-Day Plan](./90-day-transformation-plan.md) | Personal blueprint |

---

## 🧪 Testing

```bash
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests (Playwright)
npm run test:coverage    # Coverage report
```

---

## 📋 Personal Targets

- Wake up 6 AM, no phone first hour
- Gym 4x/week, calisthenics + running 2x/week
- Drink 1 gallon water daily
- Read 12 books/year
- Solve 200-300 LeetCode problems
- Complete AWS + Databricks certifications
- Build asset worth ₹5L

---

## 📄 License

Personal project - All rights reserved

---

**Last Updated:** December 2024
