// Phase Configuration
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

export type Phase = keyof typeof PHASE_CONFIG;

// Discipline Scoring Weights
export const DISCIPLINE_WEIGHTS = {
  wakeUpTime: 0.40,
  noPhoneFirstHour: 0.25,
  coldShower: 0.15,
  meditation: 0.15,
  planTomorrowDone: 0.05
} as const;

// Budget Limits (₹)
export const BUDGET_LIMITS = {
  ESSENTIALS: 30000,
  WANTS: 10000,
  INVESTMENTS: 20000,
  SAVINGS: 20000,
  GOALS: 15000
} as const;

// Investment Allocation
export const INVESTMENT_ALLOCATION = {
  LOW_RISK: 0.3,
  MID_RISK: 0.4,
  HIGH_RISK: 0.3
} as const;

// Fitness Targets
export const FITNESS_TARGETS = {
  WEEKLY_GYM_SESSIONS: 4,
  WEEKLY_CARDIO_SESSIONS: 2,
  DAILY_WATER_OZ: 128, // 1 Gallon
  DAILY_WATER_LITERS: 3.8,
  TARGET_LEETCODE_TOTAL: 300
} as const;

// Career Targets
export const CAREER_TARGETS = {
  LEETCODE_TOTAL: 300,
  AWS_CERT_DEADLINE_DAY: 60,
  DATABRICKS_CERT_DEADLINE_DAY: 90,
  LEETCODE_PER_WEEK: 15
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Personal Development System',
  VERSION: '1.0.0',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  PAGINATION_LIMIT: 20,
  CACHE_TTL: 3600, // 1 hour
  LLM_MAX_CALLS_PER_DAY: 10,
  LLM_PROVIDER: 'gemini',
  LLM_MODEL: 'gemini-2.0-flash-exp',
  LLM_CACHE_ENABLED: true,
  LLM_CACHE_TTL: 86400 // 24 hours
} as const;




