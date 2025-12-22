# sudo-me
A data-driven blueprint for the perfect daily routine

> **Personal Development System (PDS)** - A comprehensive, modular, and scalable application to track and manage your 90-day transformation plan across Finance, Habits, Goals, Fitness, and Learning.

---

## 📚 Documentation Index

This repository contains comprehensive documentation for the Personal Development System. The documentation is organized into focused documents for better maintainability and readability.

### 🎯 Core Documents

| Document | Description | Status |
|----------|-------------|--------|
| **[90-Day Transformation Plan](./90-day-transformation-plan.md)** | Complete 90-day blueprint with daily routines, weekly plans, and monthly milestones | ✅ Complete |
| **[Database Schema](./docs/database/schema.md)** | Complete Firestore schema (9 collections, security rules, indexes) | ✅ Complete |
| **[API Documentation](./docs/api/api-design.md)** | REST API endpoints, Cloud Functions, OpenAPI 3.0 specification | ✅ Complete |
| **[Technical Specification](./docs/reference/technical-specification.md)** | Technology stack, business logic, constants, validation | ✅ Complete |
| **[System Architecture](./docs/architecture/system-architecture.md)** | System design, data flows, deployment, scalability | ✅ Complete |
| **[Getting Started Guide](./docs/guides/getting-started.md)** | Developer onboarding and setup instructions | ✅ Complete |
| **[LLM Cost Optimization](./docs/reference/llm-cost-optimization.md)** | Cost-optimized LLM guide (99% savings vs OpenAI) | ✅ Complete |
| **[Enterprise Standards](./docs/ENTERPRISE-STANDARDS.md)** | Quality checklist and compliance standards | ✅ Complete |

---

## 🚀 Quick Start

### For Users
- Read the **[90-Day Transformation Plan](./90-day-transformation-plan.md)** to understand the complete blueprint

### For Developers
1. **Start Here:** [Getting Started Guide](./docs/guides/getting-started.md) ✅ Complete
2. **Database:** [Database Schema](./docs/database/schema.md) ✅ Complete
3. **API:** [API Design](./docs/api/api-design.md) ✅ Complete
4. **Technical:** [Technical Specification](./docs/reference/technical-specification.md) ✅ Complete
5. **Architecture:** [System Architecture](./docs/architecture/system-architecture.md) ✅ Complete

**📋 Full Documentation Index:** [docs/README.md](./docs/README.md)  
**🏢 Enterprise Standards:** [Enterprise Standards Checklist](./docs/ENTERPRISE-STANDARDS.md)

### For Project Managers
- Review **[Enterprise Standards](./docs/ENTERPRISE-STANDARDS.md)** for quality checklist

---

## 📋 Project Overview

### **📌 Background & Targets**

- Wake up 6 AM, no phone first hour
- Cook and eat fresh
- Gym 4x/week
- Start calisthenics + running 2x/week
- Drink 1 gallon of water daily
- Meditate 10 minutes
- Intermittent fasting weekly
- Read 12 books/year
- Learn swimming
- Complete AWS + Databricks certifications
- Solve 200–300 LeetCode problems
- Prepare for job switch (20 LPA+ India or Amsterdam)
- Build asset worth ₹5L
- Control impulses; develop discipline
- Take cold showers
- Plan tomorrow every night
- 3 domestic + 1 international trip

### **📌 Budget Structure**

- Essentials: ₹30,000
- Wants: ₹10,000
- Investments: ₹20,000
- Savings: ₹20,000
- Goals: ₹15,000

### **📌 Investment Breakdown**

- Low risk: 30%
- Mid risk: 40%
- High risk: 30%
- (SIP + ETFs + gold + silver + stocks)

### **📌 Goals**

**Short term:** emergency fund, 3–4 weekend trips, 2–3 medium trips, 1 major trip, fitness, grooming, learning

**Mid term:** migrate to EU/AU, luxury bike, extra emergency buffer

**Long term:** wealth 50–90 lakh, 5L emergency fund, 1Cr term insurance

---

## 🏗️ System Architecture Overview

### Technology Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **State Management:** TanStack Query, Zustand
- **AI/LLM:** Google Gemini Flash 2.5 (Recommended - 60x cheaper, free tier) | Ollama (Local, free)
- **Validation:** Zod
- **Hosting:** Vercel (Frontend), Firebase/Google Cloud (Backend)

### Core Modules
1. **Finance Module** - Budget tracking, investment portfolio, financial planning
2. **Goal Management** - Short/Mid/Long term goals with LLM-powered suggestions
3. **Habit Tracking** - Daily logs, discipline scoring, streak management
4. **Fitness Log** - Workout tracking, water intake, progress analytics
5. **Career Tracker** - LeetCode progress, certifications, job applications

---

## 📖 Documentation Structure

**✅ Reorganized for Implementation**

The documentation is now properly structured for implementation:

```
docs/
├── README.md                          # Documentation index
├── database/
│   └── schema.md                      # Firestore schema (9 collections)
├── api/
│   ├── api-design.md                  # REST API documentation
│   └── openapi.yaml                   # OpenAPI 3.0 specification
├── architecture/
│   └── system-architecture.md        # System design & deployment
├── reference/
│   ├── technical-specification.md     # Business logic & constants
│   ├── llm-cost-optimization.md      # LLM cost guide (99% savings)
│   └── llm-implementation-guide.md    # LLM setup guide
├── guides/
│   └── getting-started.md             # Developer onboarding
└── ENTERPRISE-STANDARDS.md            # Quality checklist

Root Files:
├── 90-day-transformation-plan.md      # Complete transformation blueprint
├── CHANGELOG.md                        # Version history
└── README.md                           # This file
```

**Total: 13 essential files - Enterprise Standard**

**📊 Status:** ✅ **Production Ready - Enterprise Standard**  
**💰 Cost Optimization:** [LLM Cost Guide](./docs/reference/llm-cost-optimization.md) - **99% savings vs OpenAI**

### 🚀 Production Documentation Setup

For enterprise/production use, documentation should be:
- **Hosted on a documentation site** (Docusaurus, GitBook, MkDocs)
- **API docs** generated from OpenAPI/Swagger specs
- **Architecture diagrams** (C4, ERD, Sequence diagrams)
- **Code examples** for all features
- **Automated generation** from code
- **Versioned** with changelog
- **Searchable** with full-text search

**Documentation Structure:** See [docs/STRUCTURE.md](./docs/STRUCTURE.md) for complete file organization.

---

## 🎯 Key Features

### Finance Module
- Real-time budget monitoring and forecasting
- Investment portfolio tracking with auto-allocation (30/40/30)
- Financial analytics and insights
- Monthly/annual reports and exports

### Goal Management
- **Short-term (90 days):** Daily progress, weekly milestones
- **Mid-term (6 months):** Monthly reviews, quarterly milestones
- **Long-term (1 year):** Strategic planning, vision alignment
- LLM-powered goal suggestions and refinement

### Interactive Interface
- Real-time updates with Firestore listeners
- Drag-and-drop goal management (Kanban, Timeline, Calendar)
- Interactive charts and analytics
- Gamification (streaks, achievements, celebrations)

### Scalable Architecture
- Serverless microservices
- Horizontal and vertical scaling
- Cost-optimized (free-tier focused)
- Multi-region deployment ready

---

## 📝 Development Status

### Documentation (✅ Enterprise Ready)
- [x] 90-Day Transformation Plan - Complete
- [x] Database Schema - Complete (9 collections)
- [x] API Documentation - Complete (OpenAPI 3.0)
- [x] Technical Specification - Complete
- [x] System Architecture - Complete
- [x] Getting Started Guide - Complete
- [x] CHANGELOG - Complete
- [x] Enterprise Standards - Complete

### Implementation
- [x] Code Implementation - Complete
- [x] Testing - Complete (Unit, Integration, E2E)
- [ ] Deployment - Pending

**Documentation Status:** ✅ **95% Complete - Production Ready**

---

## 🧪 Testing

This project includes comprehensive testing infrastructure with **Jest** for unit/integration tests and **Playwright** for E2E tests.

### Quick Start

```bash
# Install dependencies
npm install

# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run E2E tests (requires browser setup first)
npm run playwright:install
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

### Test Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run all Jest tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI mode |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |
| `npm run test:all` | Run all tests (unit, integration, E2E) |

### Test Structure

```
tests/
├── setup.ts              # Jest setup and global mocks
├── unit/                 # Unit tests
│   └── lib/
│       ├── calculations.test.ts
│       ├── utils.test.ts
│       └── validations.test.ts
├── integration/          # Integration tests
│   └── api/
│       ├── generate-plan.test.ts
│       └── coaching.test.ts
├── e2e/                  # End-to-end tests
│   ├── auth.e2e.ts
│   ├── onboarding.e2e.ts
│   └── dashboard.e2e.ts
├── mocks/                # Mock implementations
│   ├── index.ts
│   └── supabase.ts
├── fixtures/             # Test data
│   ├── index.ts
│   └── users.ts
└── config/               # Test configuration
    └── environments.ts
```

### Coverage

Code coverage thresholds are set to **70%** for:
- Branches
- Functions
- Lines
- Statements

View the coverage report after running `npm run test:coverage`:
```bash
open coverage/lcov-report/index.html
```

### CI/CD Integration

Tests run automatically on GitHub Actions:
- **Unit & Integration tests**: On every PR
- **E2E tests**: On PRs to `main` branch
- **Smoke tests**: After production deployment

📖 **Full Testing Documentation:** [docs/TESTING.md](./docs/TESTING.md)

---

## 🤝 Contributing

This is a personal development project. For questions or suggestions, please refer to the relevant documentation sections.

---

## 📄 License

Personal project - All rights reserved

---

**Last Updated:** 2024
**Documentation Version:** 1.0
