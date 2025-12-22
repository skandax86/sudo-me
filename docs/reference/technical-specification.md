# Technical Specification

**Version:** 1.0.0  
**Last Updated:** December 18, 2024  
**Status:** ✅ Production Ready

---

## Overview

This document defines the complete technical specification for the Personal Development System (PDS), including technology stack, business logic, configuration constants, and implementation requirements.

---

## Technology Stack

### Frontend

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Next.js** | 14+ | Framework | App Router, Server Components, SEO |
| **TypeScript** | 5+ | Language | Type safety, better DX |
| **Tailwind CSS** | 3+ | Styling | Utility-first, fast development |
| **Shadcn/UI** | Latest | Components | Accessible, customizable |
| **TanStack Query** | v5 | Server State | Data fetching, caching |
| **Zustand** | Latest | Client State | Lightweight, simple |
| **Zod** | Latest | Validation | Schema-first validation |
| **date-fns** | Latest | Date Handling | Reliable date operations |

### Backend

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Firebase Auth** | v9+ | Authentication | Email/Password, OAuth |
| **Firestore** | v9+ | Database | Real-time, scalable, free tier |
| **Cloud Functions** | v2 | Serverless | Event-driven, scalable |
| **Firebase Storage** | v9+ | File Storage | User uploads, evidence |

### AI/LLM

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Google Gemini Flash 2.5** | Primary LLM | ✅ **RECOMMENDED** - 60x cheaper than GPT-4, free tier available |
| **Ollama** | Local Development | FREE - Runs locally, no API costs |
| **Hugging Face** | Fallback | Free tier available, multiple models |
| **Gemini Pro 2.5** | Premium (Optional) | Higher quality for complex tasks |
| **Vercel AI SDK** | LLM Integration | Unified API for multiple providers |

**Cost Optimization:** See [LLM Cost Optimization Guide](./llm-cost-optimization.md)

### Hosting & Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Firebase Hosting** | Alternative frontend |
| **Google Cloud** | Backend infrastructure |

---

## Core Business Logic

### Phase System (90-Day Plan)

The application enforces a three-phase system based on days from `startDate`:

```typescript
// lib/constants.ts
export const PHASE_CONFIG = {
  FOUNDATION: { 
    start: 1, 
    end: 30, 
    name: 'Foundation',
    focus: 'Discipline & Consistency'
  },
  INTENSITY: { 
    start: 31, 
    end: 60, 
    name: 'Intensity',
    focus: 'Skill Stacking & Acceleration'
  },
  MASTERY: { 
    start: 61, 
    end: 90, 
    name: 'Mastery',
    focus: 'Execution & Polishing'
  }
} as const;

// Phase detection function
export function getCurrentPhase(startDate: Date): Phase {
  const daysElapsed = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  
  if (daysElapsed <= 30) return 'FOUNDATION';
  if (daysElapsed <= 60) return 'INTENSITY';
  return 'MASTERY';
}
```

**Phase Features:**
- **Phase 1:** Basic habit tracking, boolean completion
- **Phase 2:** Advanced metrics, secondary certifications
- **Phase 3:** Job switch dashboard, asset optimization

---

### Discipline Scoring Algorithm

Daily discipline score (0-100%) calculated from morning protocol:

```typescript
export const DISCIPLINE_WEIGHTS = {
  wakeUpTime: 0.40,        // 40% - Critical
  noPhoneFirstHour: 0.25,  // 25% - High
  coldShower: 0.15,        // 15%
  meditation: 0.15,        // 15%
  planTomorrowDone: 0.05   // 5%
} as const;

// Wake time scoring thresholds
export const WAKE_TIME_SCORING = {
  PERFECT: 0,      // 6:00-6:15 = 100%
  GOOD: 15,        // 6:15-6:30 = 75%
  ACCEPTABLE: 30,  // 6:30-7:00 = 50%
  LATE: 60         // After 7:00 = 0%
} as const;

export function calculateDisciplineScore(log: DailyLog): number {
  const wakeScore = calculateWakeTimeScore(log.wakeUpTime);
  const phoneScore = log.habits.noPhoneFirstHour ? 100 : 0;
  const showerScore = log.habits.coldShower ? 100 : 0;
  const meditationScore = log.habits.meditated ? 100 : 0;
  const planScore = log.habits.plannedTomorrow ? 100 : 0;
  
  return (
    wakeScore * DISCIPLINE_WEIGHTS.wakeUpTime +
    phoneScore * DISCIPLINE_WEIGHTS.noPhoneFirstHour +
    showerScore * DISCIPLINE_WEIGHTS.coldShower +
    meditationScore * DISCIPLINE_WEIGHTS.meditation +
    planScore * DISCIPLINE_WEIGHTS.planTomorrowDone
  );
}
```

---

### Financial Logic (Budget System)

```typescript
export const BUDGET_LIMITS = {
  ESSENTIALS: 30000,      // Max ₹30,000/month
  WANTS: 10000,           // Max ₹10,000/month
  INVESTMENTS: 20000,     // Target ₹20,000/month
  SAVINGS: 20000,         // Target ₹20,000/month
  GOALS: 15000            // Target ₹15,000/month
} as const;

export const INVESTMENT_ALLOCATION = {
  LOW_RISK: 0.3,   // 30% - Liquid Funds, Emergency Fund
  MID_RISK: 0.4,   // 40% - ETFs, Gold, Silver
  HIGH_RISK: 0.3   // 30% - Stocks, Sectoral Funds
} as const;

// Auto-allocation function
export function allocateInvestment(amount: number) {
  return {
    lowRisk: Math.round(amount * INVESTMENT_ALLOCATION.LOW_RISK),
    midRisk: Math.round(amount * INVESTMENT_ALLOCATION.MID_RISK),
    highRisk: Math.round(amount * INVESTMENT_ALLOCATION.HIGH_RISK)
  };
}

// Budget health check
export function checkBudgetHealth(
  category: string, 
  spent: number, 
  limit: number
): BudgetStatus {
  const percentage = (spent / limit) * 100;
  
  if (percentage >= 100) return 'BREACH';
  if (percentage >= 90) return 'WARNING';
  if (percentage >= 75) return 'CAUTION';
  return 'HEALTHY';
}
```

---

### Fitness Logic (4+2 Split)

```typescript
export const FITNESS_TARGETS = {
  WEEKLY_GYM_SESSIONS: 4,
  WEEKLY_CARDIO_SESSIONS: 2,
  DAILY_WATER_OZ: 128,        // 1 Gallon
  DAILY_WATER_LITERS: 3.8,
  TARGET_LEETCODE_TOTAL: 300
} as const;

// Weekly fitness validator
export function validateWeeklyFitness(workouts: Workout[]): FitnessStatus {
  const gymCount = workouts.filter(w => w.type === 'Gym').length;
  const cardioCount = workouts.filter(w => 
    ['Running', 'Calisthenics', 'Swimming'].includes(w.type)
  ).length;
  
  return {
    gymSessions: gymCount,
    gymTarget: FITNESS_TARGETS.WEEKLY_GYM_SESSIONS,
    gymMet: gymCount >= FITNESS_TARGETS.WEEKLY_GYM_SESSIONS,
    cardioSessions: cardioCount,
    cardioTarget: FITNESS_TARGETS.WEEKLY_CARDIO_SESSIONS,
    cardioMet: cardioCount >= FITNESS_TARGETS.WEEKLY_CARDIO_SESSIONS,
    overallMet: gymCount >= 4 && cardioCount >= 2
  };
}
```

---

### Career & Learning Engine

```typescript
export const CAREER_TARGETS = {
  LEETCODE_TOTAL: 300,
  AWS_CERT_DEADLINE_DAY: 60,
  DATABRICKS_CERT_DEADLINE_DAY: 90,
  LEETCODE_PER_WEEK: 15
} as const;

// LeetCode progress calculation
export function calculateLeetCodeProgress(solved: number): Progress {
  const percentage = (solved / CAREER_TARGETS.LEETCODE_TOTAL) * 100;
  const remaining = CAREER_TARGETS.LEETCODE_TOTAL - solved;
  const weeklyTarget = CAREER_TARGETS.LEETCODE_PER_WEEK;
  
  return {
    solved,
    total: CAREER_TARGETS.LEETCODE_TOTAL,
    percentage: Math.round(percentage),
    remaining,
    weeksRemaining: Math.ceil(remaining / weeklyTarget)
  };
}
```

---

## Configuration Constants

### Environment Variables

```typescript
// .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# LLM Configuration (Recommended: Gemini Flash 2.5 - Free tier available)
GEMINI_API_KEY=your_gemini_key  # Get free key: https://aistudio.google.com/apikey

# Optional: Local development (Ollama - completely free, no API key needed)
# OLLAMA_URL=http://localhost:11434

# Optional: Fallback (Hugging Face - free tier: 1000 req/month)
# HUGGINGFACE_API_KEY=your_hf_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Application Constants

```typescript
// lib/constants.ts
export const APP_CONFIG = {
  NAME: 'Personal Development System',
  VERSION: '1.0.0',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  PAGINATION_LIMIT: 20,
  CACHE_TTL: 3600, // 1 hour
  LLM_MAX_CALLS_PER_DAY: 10,
  LLM_PROVIDER: 'gemini', // 'gemini' | 'ollama' | 'huggingface'
  LLM_MODEL: 'gemini-2.0-flash-exp', // Gemini Flash (free tier)
  LLM_CACHE_ENABLED: true,
  LLM_CACHE_TTL: 86400 // 24 hours
} as const;
```

---

## Validation Schemas (Zod)

```typescript
// lib/validations.ts
import { z } from 'zod';

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  startDate: z.date(),
  targetWeight: z.number().positive().optional(),
  currentSalary: z.number().positive().optional(),
  targetSalary: z.number().min(2000000).optional()
});

export const DailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  habits: z.object({
    wokeUpAt6am: z.boolean(),
    coldShower: z.boolean(),
    noPhoneFirstHour: z.boolean(),
    meditated: z.boolean(),
    plannedTomorrow: z.boolean()
  }),
  fitness: z.object({
    workoutType: z.enum(['Gym', 'Run', 'Calisthenics', 'Swim', 'Rest']),
    waterIntakeOz: z.number().min(0).max(200),
    sleepHours: z.number().min(0).max(24).optional()
  }),
  learning: z.object({
    leetCodeSolved: z.number().int().min(0),
    pagesRead: z.number().int().min(0),
    studyHours: z.number().min(0).max(24)
  }),
  journal: z.object({
    impulseControlRating: z.number().int().min(1).max(5).optional(),
    notes: z.string().max(5000).optional()
  }).optional()
});

export const TransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['Expense', 'Income']),
  category: z.enum(['Essentials', 'Wants', 'Investments', 'Savings', 'Goals']),
  description: z.string().min(1).max(500),
  date: z.date()
});

export const GoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['Fitness', 'Career', 'Finance', 'Habits', 'Learning', 'Travel', 'Health', 'Lifestyle']),
  timeframe: z.enum(['Short-term', 'Mid-term', 'Long-term']),
  targetDate: z.date(),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'Cancelled', 'On Hold'])
});
```

---

## Error Handling

### Error Codes

```typescript
export const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Budget
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
  BUDGET_WARNING: 'BUDGET_WARNING',
  
  // LLM
  LLM_RATE_LIMIT: 'LLM_RATE_LIMIT',
  LLM_ERROR: 'LLM_ERROR',
  
  // General
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;
```

---

## Performance Requirements

### Frontend
- Initial Load: < 2 seconds
- Time to Interactive: < 3.5 seconds
- Lighthouse Score: > 90
- Bundle Size: < 200KB gzipped

### Backend
- Cloud Function Cold Start: < 3 seconds
- Warm Function Response: < 500ms
- Firestore Query: < 100ms (single), < 500ms (aggregated)
- LLM Response: < 5 seconds

---

## Security Requirements

1. **Authentication:** Firebase Auth with MFA support
2. **Authorization:** Firestore Security Rules (user-based isolation)
3. **Data Encryption:** At rest (Firestore), in transit (HTTPS/TLS)
4. **Input Validation:** Zod schemas for all inputs
5. **Rate Limiting:** API rate limits, LLM call limits
6. **CORS:** Configured for production domain only

---

**See Also:**
- [Database Schema](../database/schema.md)
- [API Documentation](../api/api-design.md)
- [Architecture](../architecture/system-architecture.md)

