/**
 * Test Fixtures Index
 * Central export for all test fixtures and data generators
 */

export * from './users';

// Daily log fixtures
export const testDailyLogs = {
  perfect: {
    woke_up_at_6am: true,
    cold_shower: true,
    no_phone_first_hour: true,
    meditated: true,
    planned_tomorrow: true,
    workout_type: 'Gym' as const,
    water_intake_oz: 128,
    sleep_hours: 8,
    leetcode_solved: 5,
    pages_read: 30,
    study_hours: 3,
    discipline_score: 100,
  },
  
  partial: {
    woke_up_at_6am: true,
    cold_shower: false,
    no_phone_first_hour: true,
    meditated: false,
    planned_tomorrow: true,
    workout_type: 'Run' as const,
    water_intake_oz: 64,
    sleep_hours: 6.5,
    leetcode_solved: 2,
    pages_read: 10,
    study_hours: 1,
    discipline_score: 70,
  },
  
  minimal: {
    woke_up_at_6am: false,
    cold_shower: false,
    no_phone_first_hour: false,
    meditated: false,
    planned_tomorrow: false,
    workout_type: 'Rest' as const,
    water_intake_oz: 32,
    sleep_hours: 5,
    leetcode_solved: 0,
    pages_read: 0,
    study_hours: 0,
    discipline_score: 0,
  },
};

// Transaction fixtures
export const testTransactions = {
  expense: {
    amount: 1500,
    type: 'Expense' as const,
    category: 'Essentials' as const,
    description: 'Groceries',
  },
  
  income: {
    amount: 100000,
    type: 'Income' as const,
    category: 'Savings' as const,
    description: 'Monthly salary',
  },
  
  investment: {
    amount: 20000,
    type: 'Expense' as const,
    category: 'Investments' as const,
    description: 'SIP contribution',
  },
};

// Goal fixtures
export const testGoals = {
  fitness: {
    title: 'Lose 10 kg',
    description: 'Reach target weight of 70kg',
    category: 'Fitness' as const,
    timeframe: 'mid' as const,
    target_value: 70,
    current_value: 80,
    unit: 'kg',
    status: 'active' as const,
  },
  
  career: {
    title: 'Complete AWS Certification',
    description: 'Get AWS Solutions Architect certification',
    category: 'Career' as const,
    timeframe: 'short' as const,
    target_value: 1,
    current_value: 0,
    unit: 'certification',
    status: 'active' as const,
  },
  
  finance: {
    title: 'Build emergency fund',
    description: '6 months of expenses saved',
    category: 'Finance' as const,
    timeframe: 'long' as const,
    target_value: 300000,
    current_value: 100000,
    unit: 'INR',
    status: 'active' as const,
  },
};

// Onboarding data fixtures
export const testOnboardingData = {
  minimal: {
    focusAreas: ['health'],
    goalsByFocus: { health: ['lose_weight'] },
    customGoals: {},
    challenges: { health: 'build_consistency' },
    hoursPerDay: 1,
    daysPerWeek: 5,
    planDuration: 30,
    wakeUpTime: '06:00',
    sleepTime: '22:00',
    workSchedule: '9-5',
    age: 25,
    trackingAreas: ['weight'],
    customTracking: [],
    monthlyBudget: 50000,
  },
  
  comprehensive: {
    focusAreas: ['health', 'career', 'finance', 'discipline'],
    goalsByFocus: {
      health: ['lose_weight', 'build_muscle', 'improve_stamina'],
      career: ['get_promoted', 'learn_skills', 'get_certified'],
      finance: ['save_money', 'start_investing', 'budget_better'],
      discipline: ['wake_early', 'build_routine', 'reduce_phone'],
    },
    customGoals: {
      health: ['Run a half marathon'],
      career: ['Start a side project'],
    },
    challenges: {
      health: 'stay_motivated',
      career: 'break_through',
      finance: 'control_spending',
      discipline: 'beat_procrastination',
    },
    hoursPerDay: 3,
    daysPerWeek: 6,
    planDuration: 90,
    wakeUpTime: '05:30',
    sleepTime: '21:30',
    workSchedule: 'remote',
    age: 30,
    trackingAreas: ['weight', 'workouts', 'calories', 'habits', 'spending', 'investments'],
    customTracking: ['Meditation minutes', 'Books read'],
    monthlyBudget: 80000,
  },
};

