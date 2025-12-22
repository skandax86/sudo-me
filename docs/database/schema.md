# Database Schema

**Firestore Database Design for Personal Development System**

---

## Overview

The PDS uses **Firebase Firestore** (NoSQL) as the primary database. All collections use user-based data isolation for security and scalability.

**Key Principles:**
- User UID as primary key for data isolation
- Sub-collections under `users/{uid}/` for user-specific data
- Strict typing with Zod schemas
- Real-time synchronization support

---

## Collections

### 1. `users` (Root Collection)

**Purpose:** User profile and global settings

**Document ID:** User UID (from Firebase Auth)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | string | ✅ | Document ID (User UID) |
| `email` | string | ✅ | User email address |
| `name` | string | ✅ | User display name |
| `wakeTime` | Timestamp | ✅ | Target wake time (6:00 AM) |
| `startDate` | Timestamp | ✅ | 90-day plan start date |
| `longTermGoals` | string[] | ❌ | Long-term goals array |
| `initial90DayPlan` | object | ❌ | Initial plan configuration |
| `profile` | object | ❌ | Additional profile data |
| `gamification` | object | ❌ | Streak, XP, level data |
| `createdAt` | Timestamp | ✅ | Account creation date |
| `updatedAt` | Timestamp | ✅ | Last update timestamp |

**Example Document:**
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "wakeTime": "2024-01-01T06:00:00Z",
  "startDate": "2024-01-01T00:00:00Z",
  "longTermGoals": ["Build ₹5L asset", "Migrate to EU"],
  "profile": {
    "targetWeight": 75,
    "salary": 2000000
  },
  "gamification": {
    "currentStreak": 7,
    "totalXp": 1250,
    "level": "Beginner"
  }
}
```

---

### 2. `daily_logs` (Sub-collection of `users`)

**Path:** `users/{uid}/daily_logs/{date}`

**Purpose:** Daily habit tracking and metrics

**Document ID:** ISO date format (YYYY-MM-DD)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | ✅ | ISO date (YYYY-MM-DD) |
| `habits` | object | ✅ | Habit completion flags |
| `habits.wokeUpAt6am` | boolean | ✅ | Woke up at 6 AM |
| `habits.coldShower` | boolean | ✅ | Took cold shower |
| `habits.noPhoneFirstHour` | boolean | ✅ | No phone first hour |
| `habits.meditated` | boolean | ✅ | Completed meditation |
| `habits.plannedTomorrow` | boolean | ✅ | Planned next day |
| `fitness` | object | ✅ | Fitness metrics |
| `fitness.workoutType` | string | ✅ | 'Gym' \| 'Run' \| 'Calisthenics' \| 'Swim' \| 'Rest' |
| `fitness.waterIntakeOz` | number | ✅ | Water intake in ounces (target: 128) |
| `fitness.sleepHours` | number | ❌ | Sleep hours (target: 7-8) |
| `learning` | object | ✅ | Learning metrics |
| `learning.leetCodeSolved` | number | ✅ | LeetCode problems solved |
| `learning.pagesRead` | number | ✅ | Pages read |
| `learning.studyHours` | number | ✅ | Study hours |
| `journal` | object | ❌ | Journal entry |
| `journal.impulseControlRating` | number | ❌ | 1-5 rating |
| `journal.notes` | string | ❌ | Journal text (for LLM) |
| `disciplineScore` | number | ❌ | Calculated 0-100 score |
| `createdAt` | Timestamp | ✅ | Log creation time |
| `updatedAt` | Timestamp | ✅ | Last update time |

**Example Document:**
```json
{
  "date": "2024-01-15",
  "habits": {
    "wokeUpAt6am": true,
    "coldShower": true,
    "noPhoneFirstHour": true,
    "meditated": true,
    "plannedTomorrow": true
  },
  "fitness": {
    "workoutType": "Gym",
    "waterIntakeOz": 128,
    "sleepHours": 7.5
  },
  "learning": {
    "leetCodeSolved": 2,
    "pagesRead": 20,
    "studyHours": 2
  },
  "journal": {
    "impulseControlRating": 4,
    "notes": "Had a productive day..."
  },
  "disciplineScore": 95
}
```

---

### 3. `transactions` (Sub-collection of `users`)

**Path:** `users/{uid}/transactions/{transactionId}`

**Purpose:** Financial transactions and expenses

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Auto-generated transaction ID |
| `amount` | number | ✅ | Transaction amount (positive) |
| `type` | string | ✅ | 'Expense' \| 'Income' |
| `category` | string | ✅ | 'Essentials' \| 'Wants' \| 'Investments' \| 'Savings' \| 'Goals' |
| `description` | string | ✅ | Transaction description |
| `date` | Timestamp | ✅ | Transaction date |
| `createdAt` | Timestamp | ✅ | Creation timestamp |
| `updatedAt` | Timestamp | ✅ | Last update timestamp |

**Category Limits:**
- Essentials: Max ₹30,000/month
- Wants: Max ₹10,000/month
- Investments: Target ₹20,000/month
- Savings: Target ₹20,000/month
- Goals: Target ₹15,000/month

---

### 4. `goals` (Sub-collection of `users`)

**Path:** `users/{uid}/goals/{goalId}`

**Purpose:** User goals (Short/Mid/Long term)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Auto-generated goal ID |
| `title` | string | ✅ | Goal title |
| `description` | string | ❌ | Goal description |
| `category` | string | ✅ | 'Fitness' \| 'Career' \| 'Finance' \| 'Habits' \| 'Learning' \| 'Travel' \| 'Health' \| 'Lifestyle' |
| `timeframe` | string | ✅ | 'Short-term' \| 'Mid-term' \| 'Long-term' |
| `targetDate` | Timestamp | ✅ | Goal deadline |
| `priority` | string | ✅ | 'High' \| 'Medium' \| 'Low' |
| `status` | string | ✅ | 'Not Started' \| 'In Progress' \| 'Completed' \| 'Cancelled' \| 'On Hold' |
| `progress` | number | ✅ | Progress percentage (0-100) |
| `successMetrics` | array | ❌ | Array of success metrics |
| `parentGoalId` | string | ❌ | Parent goal ID (for hierarchy) |
| `supportingGoalIds` | string[] | ❌ | Supporting goal IDs |
| `actionPlan` | array | ❌ | Step-by-step action plan |
| `createdAt` | Timestamp | ✅ | Creation timestamp |
| `updatedAt` | Timestamp | ✅ | Last update timestamp |
| `completedAt` | Timestamp | ❌ | Completion timestamp |

**Timeframe Definitions:**
- Short-term: 90 days
- Mid-term: 6 months (180 days)
- Long-term: 1 year (365 days)

---

### 5. `budgets` (Sub-collection of `users`)

**Path:** `users/{uid}/budgets/{month}`

**Purpose:** Monthly budget tracking

**Document ID:** YYYY-MM format

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `month` | string | ✅ | YYYY-MM format |
| `categories` | object | ✅ | Budget categories |
| `categories.Essentials` | object | ✅ | { allocated, spent, limit: 30000 } |
| `categories.Wants` | object | ✅ | { allocated, spent, limit: 10000 } |
| `categories.Investments` | object | ✅ | { allocated, spent, target: 20000 } |
| `categories.Savings` | object | ✅ | { allocated, spent, target: 20000 } |
| `categories.Goals` | object | ✅ | { allocated, spent, target: 15000 } |
| `projectedSpending` | number | ❌ | Forecasted end-of-month spending |
| `savingsRate` | number | ❌ | Calculated savings rate |
| `createdAt` | Timestamp | ✅ | Creation timestamp |
| `updatedAt` | Timestamp | ✅ | Last update timestamp |

---

### 6. `investment_portfolio` (Sub-collection of `users`)

**Path:** `users/{uid}/investment_portfolio/{portfolioId}`

**Purpose:** Investment portfolio tracking

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Portfolio entry ID |
| `date` | Timestamp | ✅ | Portfolio snapshot date |
| `totalValue` | number | ✅ | Total portfolio value |
| `allocations` | object | ✅ | Risk-based allocations |
| `allocations.lowRisk` | object | ✅ | { amount, percentage: 0.3, instruments: [] } |
| `allocations.midRisk` | object | ✅ | { amount, percentage: 0.4, instruments: [] } |
| `allocations.highRisk` | object | ✅ | { amount, percentage: 0.3, instruments: [] } |
| `holdings` | array | ✅ | Individual holdings |
| `performance` | object | ❌ | { roi, absoluteReturns, cagr } |
| `updatedAt` | Timestamp | ✅ | Last update timestamp |

**Allocation Rules:**
- Low Risk: 30% (Liquid Funds, Emergency Fund)
- Mid Risk: 40% (ETFs, Gold, Silver)
- High Risk: 30% (Stocks, Sectoral Funds)

---

### 7. `workouts` (Sub-collection of `users`)

**Path:** `users/{uid}/workouts/{workoutId}`

**Purpose:** Fitness workout logs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Workout ID |
| `date` | Timestamp | ✅ | Workout date |
| `type` | string | ✅ | 'Gym' \| 'Running' \| 'Calisthenics' \| 'Swimming' |
| `durationMins` | number | ✅ | Workout duration |
| `details` | object | ❌ | Type-specific metrics |
| `goalProgress` | string | ❌ | Progress notes |
| `createdAt` | Timestamp | ✅ | Creation timestamp |

**Details Examples:**
- Gym: `{ sets: [], reps: [], weights: [] }`
- Running: `{ distance: 5, time: 30, pace: 6 }`
- Calisthenics: `{ exercise: "L-sit", holdTime: 15 }`

---

### 8. `notifications` (Sub-collection of `users`)

**Path:** `users/{uid}/notifications/{notificationId}`

**Purpose:** User notifications and alerts

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Notification ID |
| `type` | string | ✅ | 'coach_tip' \| 'budget_alert' \| 'streak_milestone' \| 'weekly_scorecard' \| 'phase_transition' |
| `title` | string | ✅ | Notification title |
| `message` | string | ✅ | Notification message |
| `read` | boolean | ✅ | Read status (default: false) |
| `metadata` | object | ❌ | Additional data |
| `createdAt` | Timestamp | ✅ | Creation timestamp |

---

### 9. `weekly_scorecards` (Sub-collection of `users`)

**Path:** `users/{uid}/weekly_scorecards/{weekStartDate}`

**Purpose:** Weekly progress scorecards

**Document ID:** ISO date (YYYY-MM-DD) of week start

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `weekStartDate` | string | ✅ | ISO date (YYYY-MM-DD) |
| `weekEndDate` | string | ✅ | ISO date (YYYY-MM-DD) |
| `fitness` | object | ✅ | { workoutsCompleted, target: 6, waterCompliance } |
| `discipline` | object | ✅ | { daysCompleted, target: 7, averageScore } |
| `skills` | object | ✅ | { leetCodeSolved, pagesRead, target: { lc: 15, pages: 140 } } |
| `finance` | object | ✅ | { totalAllocated, target: 55000, budgetCompliance } |
| `career` | object | ✅ | { companiesResearched, resumeSectionsUpdated } |
| `totalScore` | number | ✅ | Overall score (0-100%) |
| `createdAt` | Timestamp | ✅ | Creation timestamp |

---

## Indexes

### Required Composite Indexes

```javascript
// Firestore Indexes Configuration (firestore.indexes.json)
{
  "indexes": [
    {
      "collectionGroup": "daily_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "DESCENDING" },
        { "fieldPath": "habits.wokeUpAt6am", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "goals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timeframe", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "targetDate", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Sub-collections under users
      match /daily_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /goals/{goalId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /investment_portfolio/{portfolioId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /workouts/{workoutId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /notifications/{notificationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /weekly_scorecards/{scorecardId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Data Relationships

```
users/{uid}
├── daily_logs/{date}
├── transactions/{transactionId}
├── goals/{goalId}
│   └── (parentGoalId references goals/{goalId})
├── budgets/{month}
├── investment_portfolio/{portfolioId}
├── workouts/{workoutId}
├── notifications/{notificationId}
└── weekly_scorecards/{weekStartDate}
```

---

## Migration Strategy

1. **Initial Setup:** Create collections with initial schema
2. **Schema Evolution:** Use optional fields for backward compatibility
3. **Data Migration:** Cloud Functions for bulk updates
4. **Versioning:** Include `schemaVersion` field in documents

---

**Last Updated:** December 18, 2024  
**Schema Version:** 1.0.0




