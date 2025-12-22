# System Architecture

**Version:** 1.0.0  
**Last Updated:** December 18, 2024  
**Status:** ✅ Production Ready

---

## Overview

The Personal Development System (PDS) is built on a **serverless, microservices architecture** designed for scalability, cost-efficiency, and reliability.

**Architecture Pattern:** Serverless Microservices  
**Deployment Model:** Multi-cloud (Vercel + Firebase/Google Cloud)  
**Scalability:** Horizontal auto-scaling

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │     │
│  │  (Next.js)   │  │  (Future)    │  │  (Future)    │     │
│  └──────┬───────┘  └──────┬──────┘  └──────┬───────┘     │
└─────────┼──────────────────┼─────────────────┼────────────┘
          │                  │                 │
          └──────────────────┴─────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │         API Gateway Layer         │
          │    (Firebase Cloud Functions)     │
          └─────────────────┬─────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │      Business Logic Layer        │
          │  ┌──────────┐  ┌──────────┐     │
          │  │ Finance  │  │  Goals   │     │
          │  │ Service  │  │ Service  │     │
          │  └──────────┘  └──────────┘     │
          │  ┌──────────┐  ┌──────────┐     │
          │  │ Habits   │  │  LLM     │     │
          │  │ Service  │  │ Service  │     │
          │  └──────────┘  └──────────┘     │
          └─────────────────┬───────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │        Data Layer                   │
          │  ┌────────────┐  ┌────────────┐    │
          │  │ Firestore  │  │  Storage   │    │
          │  │ (NoSQL)    │  │  (Files)   │    │
          │  └────────────┘  └────────────┘    │
          └────────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │      External Services            │
          │  ┌────────────┐  ┌────────────┐   │
          │  │  Gemini    │  │  Ollama    │   │
          │  │  Flash 2.5 │  │  (Local)   │   │
          │  │  (Primary) │  │  (Free)    │   │
          │  └────────────┘  └────────────┘   │
          └───────────────────────────────────┘
```

---

## Component Architecture

### Frontend (Next.js)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── dashboard/         # Main dashboard
│   ├── finance/           # Finance module
│   ├── goals/             # Goals module
│   └── api/               # API routes (if needed)
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── features/          # Feature-specific components
│   └── layout/            # Layout components
├── lib/                   # Utilities and helpers
│   ├── firebase.ts        # Firebase client
│   ├── validations.ts     # Zod schemas
│   └── constants.ts       # App constants
├── hooks/                 # Custom React hooks
├── store/                 # State management (Zustand)
└── types/                 # TypeScript types
```

**Key Features:**
- Server Components for performance
- Client Components for interactivity
- Real-time updates via Firestore listeners
- Optimistic UI updates

---

### Backend (Firebase Cloud Functions)

```
functions/
├── src/
│   ├── index.ts           # Function exports
│   ├── triggers/          # Firestore triggers
│   │   ├── onDailyLogCreate.ts
│   │   ├── checkBudgetHealth.ts
│   │   └── weeklyReviewJob.ts
│   ├── http/              # HTTP endpoints
│   │   ├── finance.ts
│   │   ├── goals.ts
│   │   └── habits.ts
│   ├── services/          # Business logic
│   │   ├── FinanceService.ts
│   │   ├── GoalService.ts
│   │   └── LLMService.ts
│   └── utils/             # Utilities
│       ├── llm.ts
│       └── calculations.ts
```

**Function Types:**
- **HTTP Functions:** REST API endpoints
- **Firestore Triggers:** Event-driven processing
- **Scheduled Functions:** Cron jobs (weekly reviews)

---

### Database (Firestore)

**Structure:**
```
users/{uid}                    # User document
├── daily_logs/{date}          # Daily logs sub-collection
├── transactions/{id}          # Transactions sub-collection
├── goals/{id}                 # Goals sub-collection
├── budgets/{month}            # Budgets sub-collection
├── investment_portfolio/{id}  # Portfolio sub-collection
├── workouts/{id}              # Workouts sub-collection
├── notifications/{id}         # Notifications sub-collection
└── weekly_scorecards/{date}   # Scorecards sub-collection
```

**Key Features:**
- User-based data isolation
- Real-time synchronization
- Automatic scaling
- Offline support

---

## Data Flow

### Daily Log Creation Flow

```
User Input → Frontend Validation (Zod)
    ↓
API Call → Cloud Function (createDailyLog)
    ↓
Firestore Write → users/{uid}/daily_logs/{date}
    ↓
Trigger: onDailyLogCreate
    ↓
┌─────────────────┬─────────────────┐
│ Calculate Score │ Generate LLM Tip│
│ Update Streak   │ Write Notification│
└─────────────────┴─────────────────┘
    ↓
Real-time Update → Frontend (Firestore Listener)
```

### Budget Transaction Flow

```
User Input → Frontend Validation
    ↓
API Call → Cloud Function (addTransaction)
    ↓
Validation (BAML) → Check Budget Limits
    ↓
Firestore Write → users/{uid}/transactions/{id}
    ↓
Trigger: checkBudgetHealth
    ↓
Calculate Monthly Total → Check Limits
    ↓
If Exceeded → Generate Alert → Write Notification
    ↓
Real-time Update → Frontend
```

---

## Integration Points

### LLM Integration

**Service:** Google Gemini API (Primary)  
**Provider:** Gemini Flash 2.5 (Recommended - 60x cheaper than GPT-4, free tier available)  
**Fallback:** Ollama (Local, free) or Hugging Face (Free tier)

**Cost Optimization:** See [LLM Cost Optimization Guide](../reference/llm-cost-optimization.md)

**Use Cases:**
1. **Coaching Tips:** Daily reflection analysis
2. **Goal Suggestions:** Personalized goal recommendations
3. **Action Plans:** Goal breakdown into steps
4. **Progress Analysis:** Adaptive goal adjustments

**Flow:**
```
User Data → LLM Service → Prompt Engineering → LLM API
    ↓
Response → Validation → Cache → Store in Firestore
    ↓
Notification → User
```

---

## Scalability Design

### Horizontal Scaling

- **Frontend:** Vercel Edge Network (global CDN)
- **Backend:** Cloud Functions auto-scale (0 to N instances)
- **Database:** Firestore auto-scales (no manual sharding)

### Vertical Scaling

- **Functions:** Increase memory allocation for compute-intensive tasks
- **Database:** Firestore handles capacity automatically

### Caching Strategy

- **Frontend:** TanStack Query cache (5 minutes default)
- **API:** Function-level caching for LLM responses
- **CDN:** Static assets cached at edge

---

## Security Architecture

### Authentication & Authorization

```
User → Firebase Auth → JWT Token
    ↓
API Request → Verify Token → Check Permissions
    ↓
Firestore Rules → User-based Isolation
```

**Security Layers:**
1. **Authentication:** Firebase Auth (JWT tokens)
2. **Authorization:** Firestore Security Rules
3. **API Security:** Rate limiting, input validation
4. **Data Encryption:** At rest (Firestore), in transit (HTTPS)

---

## Monitoring & Observability

### Logging
- **Frontend:** Browser console, Sentry
- **Backend:** Cloud Logging (structured logs)
- **Format:** JSON structured logging

### Metrics
- **Performance:** Function execution time, cold starts
- **Usage:** API calls, database reads/writes
- **Errors:** Error rates, error types

### Alerts
- **Budget Breaches:** Real-time notifications
- **System Errors:** Error rate thresholds
- **Performance:** Latency thresholds

---

## Deployment Architecture

### Environments

```
Development → Staging → Production
     ↓            ↓          ↓
  Local      Firebase    Firebase
  Firebase   Project     Project
             (Test)      (Prod)
```

### CI/CD Pipeline

```
Git Push → GitHub Actions
    ↓
Run Tests → Lint → Build
    ↓
Deploy Functions → Firebase
    ↓
Deploy Frontend → Vercel
    ↓
Run Smoke Tests → Notify Team
```

---

## Disaster Recovery

### Backup Strategy
- **Firestore:** Daily automated exports to Cloud Storage
- **Functions:** Version-controlled in Git
- **Frontend:** Version-controlled in Git

### Recovery Procedures
1. **Data Loss:** Restore from Cloud Storage backup
2. **Function Failure:** Rollback to previous version
3. **Frontend Issues:** Instant rollback via Vercel

---

## Cost Optimization

### Free Tier Utilization
- **Firebase:** 50K reads/day, 20K writes/day
- **Cloud Functions:** 2M invocations/month
- **Vercel:** 100GB bandwidth/month

### Cost Monitoring
- **Budget Alerts:** Google Cloud billing alerts
- **Usage Tracking:** Monitor Firestore operations
- **Optimization:** Cache frequently accessed data

---

**See Also:**
- [Deployment Guide](./deployment.md)
- [Database Schema](../database/schema.md)
- [API Design](../api/api-design.md)

