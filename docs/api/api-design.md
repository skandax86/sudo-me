# API Design & Specification

**Version:** 1.0.0  
**Last Updated:** December 18, 2024  
**Base URL:** `https://api.pds.example.com/v1`

---

## Overview

The PDS API follows RESTful principles and uses Firebase Cloud Functions for serverless execution. All endpoints require authentication via Firebase Auth token.

**Authentication:** Bearer token in `Authorization` header  
**Content-Type:** `application/json`  
**Response Format:** JSON

---

## Authentication

All API requests require a valid Firebase Auth token:

```http
Authorization: Bearer <firebase-auth-token>
```

**Error Response (401):**
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required",
    "status": 401
  }
}
```

---

## API Endpoints

### Daily Logs

#### Create Daily Log
```http
POST /v1/daily/log
```

**Request Body:**
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
  }
}
```

**Response (201):**
```json
{
  "id": "2024-01-15",
  "disciplineScore": 95,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Triggers:**
- Updates user streak
- Generates LLM coaching tip (if journal.notes provided)

---

### Finance

#### Add Transaction
```http
POST /v1/finance/transactions
```

**Request Body:**
```json
{
  "amount": 5000,
  "type": "Expense",
  "category": "Essentials",
  "description": "Groceries",
  "date": "2024-01-15T00:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "txn_123",
  "amount": 5000,
  "category": "Essentials",
  "monthlyTotal": 25000,
  "budgetStatus": "HEALTHY",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Validation:**
- Amount must be positive
- Category must be valid enum
- Budget limits enforced

**Triggers:**
- Budget health check
- Alert if budget exceeded

---

#### Get Budget
```http
GET /v1/finance/budget?month=2024-01
```

**Response (200):**
```json
{
  "month": "2024-01",
  "categories": {
    "Essentials": {
      "allocated": 30000,
      "spent": 25000,
      "limit": 30000,
      "percentage": 83.33,
      "status": "HEALTHY"
    },
    "Wants": {
      "allocated": 10000,
      "spent": 8000,
      "limit": 10000,
      "percentage": 80.00,
      "status": "HEALTHY"
    }
  },
  "projectedSpending": 28000,
  "savingsRate": 0.45
}
```

---

#### Get Portfolio
```http
GET /v1/finance/portfolio
```

**Response (200):**
```json
{
  "totalValue": 120000,
  "allocations": {
    "lowRisk": {
      "amount": 36000,
      "percentage": 30,
      "instruments": ["Liquid Fund", "Emergency Fund"]
    },
    "midRisk": {
      "amount": 48000,
      "percentage": 40,
      "instruments": ["Nifty ETF", "Gold SIP"]
    },
    "highRisk": {
      "amount": 36000,
      "percentage": 30,
      "instruments": ["Tech Stocks"]
    }
  },
  "performance": {
    "roi": 12.5,
    "absoluteReturns": 15000
  }
}
```

---

### Goals

#### Get Goals
```http
GET /v1/goals?timeframe=Short-term&status=In Progress
```

**Query Parameters:**
- `timeframe`: `Short-term` | `Mid-term` | `Long-term`
- `status`: `Not Started` | `In Progress` | `Completed` | `Cancelled` | `On Hold`
- `category`: Goal category filter

**Response (200):**
```json
{
  "goals": [
    {
      "id": "goal_123",
      "title": "Complete AWS Certification",
      "timeframe": "Short-term",
      "status": "In Progress",
      "progress": 60,
      "targetDate": "2024-03-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

#### Create Goal
```http
POST /v1/goals
```

**Request Body:**
```json
{
  "title": "Complete AWS Certification",
  "description": "Pass AWS Solutions Architect exam",
  "category": "Career",
  "timeframe": "Short-term",
  "targetDate": "2024-03-01T00:00:00Z",
  "priority": "High"
}
```

**Response (201):**
```json
{
  "id": "goal_123",
  "title": "Complete AWS Certification",
  "status": "Not Started",
  "progress": 0,
  "actionPlan": [
    {
      "task": "Complete AWS Domain 1",
      "dueDate": "2024-01-31T00:00:00Z",
      "completed": false
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Triggers:**
- LLM generates action plan (if requested)
- Creates milestone checkpoints

---

#### Get Goal Suggestions (LLM)
```http
POST /v1/goals/suggest
```

**Request Body:**
```json
{
  "timeframe": "Short-term",
  "context": "I want to improve my career and fitness"
}
```

**Response (200):**
```json
{
  "suggestions": [
    {
      "title": "Complete AWS Solutions Architect Certification",
      "category": "Career",
      "rationale": "You're already 40% through AWS prep...",
      "priority": "High",
      "estimatedEffort": "2-3 hours daily for 30 days"
    }
  ]
}
```

---

### Workouts

#### Log Workout
```http
POST /v1/workouts
```

**Request Body:**
```json
{
  "date": "2024-01-15T00:00:00Z",
  "type": "Gym",
  "durationMins": 60,
  "details": {
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 4,
        "reps": [10, 10, 8, 8],
        "weights": [60, 60, 65, 65]
      }
    ]
  }
}
```

**Response (201):**
```json
{
  "id": "workout_123",
  "type": "Gym",
  "durationMins": 60,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Career

#### Update Career Progress
```http
POST /v1/career/progress
```

**Request Body:**
```json
{
  "leetCodeSolved": 2,
  "certificationProgress": {
    "aws": {
      "status": "In Progress",
      "progress": 40
    }
  }
}
```

---

### LLM & AI

#### Get Personalized Advice
```http
GET /v1/llm/advice
```

**Response (200):**
```json
{
  "tipCategory": "Discipline",
  "tipTitle": "Maintain Your Momentum",
  "tipText": "You've maintained a 7-day streak! Focus on...",
  "generatedAt": "2024-01-15T10:00:00Z"
}
```

---

## Cloud Functions

### Triggers

#### `onDailyLogCreate`
- **Trigger:** New document in `users/{uid}/daily_logs/{date}`
- **Actions:**
  1. Calculate discipline score
  2. Update user streak
  3. Generate LLM coaching tip (if journal.notes exists)
  4. Write notification

#### `checkBudgetHealth`
- **Trigger:** New document in `users/{uid}/transactions/{id}`
- **Actions:**
  1. Sum monthly spending by category
  2. Check against limits
  3. Generate alerts if exceeded
  4. Update budget document

#### `weeklyReviewJob`
- **Trigger:** Scheduled (Every Sunday 23:59 UTC)
- **Actions:**
  1. Aggregate last 7 days of logs
  2. Validate fitness targets (4 Gym + 2 Cardio)
  3. Validate LeetCode target (15 problems)
  4. Generate weekly scorecard
  5. Send notification

#### `onGoalCreate`
- **Trigger:** New document in `users/{uid}/goals/{id}`
- **Actions:**
  1. Generate action plan via LLM
  2. Create milestone checkpoints
  3. Set up notifications

#### `onGoalProgressUpdate`
- **Trigger:** Goal progress percentage changes
- **Actions:**
  1. Check milestone achievements (25%, 50%, 75%, 100%)
  2. Send celebration notifications
  3. Trigger LLM analysis if behind schedule

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "status": 400,
    "details": {
      "field": "additional context"
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid authentication token |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `BUDGET_EXCEEDED` | 400 | Budget limit exceeded |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **General API:** 100 requests/minute per user
- **LLM Endpoints:** 10 requests/day per user
- **Bulk Operations:** 5 requests/minute per user

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## OpenAPI Specification

See [openapi.yaml](../api/openapi.yaml) for complete OpenAPI 3.0 specification.

---

**See Also:**
- [Technical Specification](../reference/technical-specification.md)
- [Database Schema](../database/schema.md)




