// Database types for Supabase/PostgreSQL
// Updated for MVP schema

// ============================================
// CORE TYPES
// ============================================

export type Domain = 'health' | 'finance' | 'learning' | 'discipline' | 'career' | 'personal';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'bank' | 'cash' | 'wallet' | 'credit';
export type WorkoutType = 'gym' | 'cardio' | 'yoga' | 'swim' | 'rest' | 'calisthenics';
export type GymProgram = 'push' | 'pull' | 'legs' | 'full' | 'upper' | 'lower';

// Challenge System
export type TemplateType = '75_hard' | '75_soft' | 'custom';
export type ChallengeType = '75_hard' | '75_soft';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'paused';

// ============================================
// USER & PROFILE
// ============================================

export interface Profile {
  id: string;
  email: string;
  name: string;
  wake_time: string;
  start_date: string;
  long_term_goals: string[];
  target_weight: number | null;
  salary: number | null;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: string;
  timezone: string;
  // Template & Challenge
  template_type: TemplateType;
  // Onboarding & Personalization
  onboarding_complete: boolean;
  preferences: UserPreferences | null;
  generated_plan: GeneratedPlan | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  primaryFocus: string;
  specificGoals: string[];
  customGoals: string[];
  currentLevel: string;
  biggestChallenge: string;
  hoursPerDay: number;
  daysPerWeek: number;
  planDuration: number;
  wakeUpTime: string;
  sleepTime: string;
  workSchedule: string;
  age: number;
  trackingAreas: string[];
  customTracking: string[];
  monthlyBudget: number;
}

export interface GeneratedPlan {
  duration: number;
  planName: string;
  dailyHabits: Array<{
    name: string;
    target: string;
    icon: string;
    time?: string;
  }>;
  weeklyGoals: string[];
  morningRoutine: Array<{
    activity: string;
    duration: string;
    icon: string;
  }>;
  eveningRoutine: Array<{
    activity: string;
    duration: string;
    icon: string;
  }>;
  tracking: Array<{
    name: string;
    frequency: string;
    metric?: string;
  }>;
  milestones: Record<string, string>;
  budgetAllocation: {
    essentials: number;
    savings: number;
    investments: number;
    wants: number;
    goals: number;
  };
  coachingTip: string;
  wakeTime: string;
  sleepTime: string;
}

// ============================================
// USER DOMAINS
// ============================================

export interface UserDomain {
  id: string;
  user_id: string;
  domain: Domain;
  active: boolean;
  created_at: string;
}

// ============================================
// HABITS (Flexible, user-defined)
// ============================================

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  weight: number;
  domain: Domain;
  frequency: HabitFrequency;
  target_per_period: number; // e.g., 4 times per week
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

// With joined habit data
export interface HabitWithLog extends Habit {
  log?: HabitLog;
}

// ============================================
// FINANCE
// ============================================

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  opening_balance: number;
  current_balance: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  datetime: string;
  type: TransactionType;
  account_id: string | null;
  amount: number;
  amount_inr: number;
  category: string;
  subcategory: string | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

// For API input
export interface TransactionInput {
  datetime: string;
  type: TransactionType;
  account_id: string;
  amount: number;
  category: string;
  subcategory?: string;
  note?: string;
}

export interface CategoryBudget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-01
  category: string;
  limit_amount: number;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  essentials_limit: number;
  wants_limit: number;
  investments_target: number;
  savings_target: number;
  goals_target: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPortfolio {
  id: string;
  user_id: string;
  month: string;
  total_invested: number;
  low_risk_amount: number;
  mid_risk_amount: number;
  high_risk_amount: number;
  emergency_fund_balance: number;
  created_at: string;
  updated_at: string;
}

// New Investment Tables
export type InvestmentCategory = 'etf' | 'stock' | 'mutual_fund' | 'gold' | 'silver' | 'crypto' | 'fd' | 'rd' | 'nps' | 'ppf' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high';
export type InvestmentTransactionType = 'buy' | 'sell' | 'dividend' | 'sip';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BudgetParentCategory = 'essential_needs' | 'desires_wants' | 'investments' | 'savings_emergency' | 'short_mid_goals';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  symbol: string | null;
  category: InvestmentCategory;
  risk_level: RiskLevel;
  platform: string | null;
  units: number;
  avg_buy_price: number;
  current_price: number;
  invested_amount: number;
  current_value: number;
  is_sip: boolean;
  sip_amount: number | null;
  sip_date: number | null; // Day of month
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentTransaction {
  id: string;
  user_id: string;
  investment_id: string;
  transaction_date: string;
  type: InvestmentTransactionType;
  units: number;
  price_per_unit: number;
  total_amount: number;
  fees: number;
  notes: string | null;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType | 'investment';
  category: string;
  subcategory: string | null;
  amount: number;
  frequency: RecurringFrequency;
  day_of_period: number | null;
  account_id: string | null;
  investment_id: string | null;
  start_date: string;
  end_date: string | null;
  next_due: string | null;
  is_active: boolean;
  auto_log: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetPlan {
  id: string;
  user_id: string;
  year: number;
  month: number;
  essential_needs: number;
  desires_wants: number;
  investments: number;
  savings_emergency: number;
  short_mid_goals: number;
  total_income: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetSubcategory {
  id: string;
  user_id: string;
  budget_plan_id: string | null;
  parent_category: BudgetParentCategory;
  name: string;
  planned_amount: number;
  spent_amount: number;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  bank_balance: number;
  cash: number;
  investments_value: number;
  other_assets: number;
  loans: number;
  credit_card_debt: number;
  other_liabilities: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  notes: string | null;
  created_at: string;
}

// ============================================
// FITNESS / HEALTH
// ============================================

export interface Workout {
  id: string;
  user_id: string;
  workout_date: string;
  workout_type: WorkoutType;
  program: GymProgram | null;
  duration_mins: number | null;
  calories: number | null;
  effort: number | null; // 1-10
  started_at: string | null;
  ended_at: string | null;
  // Legacy fields
  exercises: ExerciseData[] | null;
  distance_km: number | null;
  pace_min_per_km: number | null;
  pull_ups: number | null;
  push_ups: number | null;
  l_sit_seconds: number | null;
  notes: string | null;
  goal_progress: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseData {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  id: string;
  workout_id: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  unit: string;
  duration_sec: number | null;
  distance_m: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

// For API input
export interface WorkoutInput {
  date: string;
  workout_type: WorkoutType;
  program?: GymProgram;
  duration_min?: number;
  effort?: number;
  exercises?: Array<{
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
}

// With exercises included
export interface WorkoutWithExercises extends Workout {
  exercise_logs?: ExerciseLog[];
}

// ============================================
// LEARNING
// ============================================

export interface LearningLog {
  id: string;
  user_id: string;
  date: string;
  leetcode_solved: number;
  pages_read: number;
  study_hours: number;
  topic: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningLogInput {
  date: string;
  leetcode_solved?: number;
  study_hours?: number;
  pages_read?: number;
  topic?: string;
  note?: string;
}

// ============================================
// DISCIPLINE
// ============================================

export interface DisciplineScore {
  id: string;
  user_id: string;
  date: string;
  habits_score: number;
  fitness_score: number;
  learning_score: number;
  finance_score: number;
  total_score: number;
  habits_data: {
    completed: number;
    total: number;
  } | null;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
  forgiveness_used_this_month: number;
  streak_started_at: string | null;
  updated_at: string;
}

// ============================================
// PERSONAL / REFLECTION
// ============================================

export interface DailyReflection {
  id: string;
  user_id: string;
  date: string;
  impulse_rating: number | null; // 1-5
  energy_level: number | null; // 1-5
  mood: number | null; // 1-5
  gratitude: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// LEGACY: DAILY LOGS (for backwards compat)
// ============================================

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  // Habits
  woke_up_at_6am: boolean;
  cold_shower: boolean;
  no_phone_first_hour: boolean;
  meditated: boolean;
  planned_tomorrow: boolean;
  // Fitness
  workout_type: 'Gym' | 'Run' | 'Calisthenics' | 'Swim' | 'Rest' | null;
  water_intake_oz: number;
  sleep_hours: number | null;
  // Learning
  leetcode_solved: number;
  pages_read: number;
  study_hours: number;
  // Journal
  impulse_control_rating: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
  // Calculated
  discipline_score: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// GOALS
// ============================================

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  timeframe: 'short' | 'mid' | 'long';
  category: 'Finance' | 'Fitness' | 'Career' | 'Learning' | 'Personal' | 'Travel';
  target_value: number | null;
  current_value: number;
  unit: string | null;
  status: 'active' | 'completed' | 'cancelled';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// WEEKLY SCORECARDS
// ============================================

export interface WeeklyScorecard {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  fitness_score: number;
  discipline_score: number;
  skills_score: number;
  finance_score: number;
  career_score: number;
  total_score: number;
  workouts_completed: number;
  discipline_days: number;
  leetcode_solved: number;
  pages_read: number;
  amount_invested: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: 'coaching_tip' | 'budget_alert' | 'streak_milestone' | 'goal_reminder' | 'achievement';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ============================================
// CHALLENGE SYSTEM
// ============================================

export interface ChallengeSession {
  id: string;
  user_id: string;
  challenge_type: ChallengeType;
  start_date: string;
  current_day: number;
  status: ChallengeStatus;
  failed_at: string | null;
  completed_at: string | null;
  restart_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengeDailyLog {
  id: string;
  session_id: string;
  user_id: string;
  date: string;
  day_number: number;
  // 75 Hard tasks
  workout_1_done: boolean;
  workout_2_outdoor_done: boolean;
  diet_followed: boolean;
  water_goal_done: boolean;
  reading_done: boolean;
  progress_photo: boolean;
  no_alcohol: boolean;
  // 75 Soft tasks
  reflection_done: boolean;
  // Status
  all_tasks_complete: boolean;
  passed: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ActiveChallenge {
  active: boolean;
  session_id?: string;
  challenge_type?: ChallengeType;
  start_date?: string;
  current_day?: number;
  total_days?: number;
  restart_count?: number;
  today_log?: {
    workout_1_done: boolean;
    workout_2_outdoor_done: boolean;
    diet_followed: boolean;
    water_goal_done: boolean;
    reading_done: boolean;
    progress_photo: boolean;
    no_alcohol: boolean;
    reflection_done: boolean;
    all_tasks_complete: boolean;
  };
}

// Challenge task definitions
export interface ChallengeTask {
  id: string;
  label: string;
  icon: string;
  required_for: ChallengeType[];
  field: keyof ChallengeDailyLog;
}

export const CHALLENGE_TASKS: ChallengeTask[] = [
  { id: 'workout_1', label: 'Workout 1', icon: '🏋️', required_for: ['75_hard', '75_soft'], field: 'workout_1_done' },
  { id: 'workout_2_outdoor', label: 'Workout 2 (Outdoor)', icon: '🏃', required_for: ['75_hard'], field: 'workout_2_outdoor_done' },
  { id: 'diet', label: 'Follow Diet', icon: '🥗', required_for: ['75_hard', '75_soft'], field: 'diet_followed' },
  { id: 'water', label: 'Hydration Goal', icon: '💧', required_for: ['75_hard', '75_soft'], field: 'water_goal_done' },
  { id: 'reading', label: 'Read 10 Pages', icon: '📖', required_for: ['75_hard', '75_soft'], field: 'reading_done' },
  { id: 'photo', label: 'Progress Photo', icon: '📸', required_for: ['75_hard'], field: 'progress_photo' },
  { id: 'no_alcohol', label: 'No Alcohol', icon: '🚫', required_for: ['75_hard'], field: 'no_alcohol' },
  { id: 'reflection', label: 'Daily Reflection', icon: '✍️', required_for: ['75_soft'], field: 'reflection_done' },
];

// ============================================
// API RESPONSE TYPES
// ============================================

export interface DashboardSummary {
  day: number;
  discipline_score: number;
  streak: number;
  domains: {
    health?: { today_done: number; total: number };
    finance?: { spent_today: number; budget_status: 'green' | 'yellow' | 'red' };
    learning?: { study_hours: number; leetcode: number };
    discipline?: { habits_done: number; total: number };
  };
  wins: DailyWin[];
  xp: { current: number; level: string; progress: number };
}

export interface DailyWin {
  id: string;
  icon: string;
  message: string;
  category: 'habit' | 'fitness' | 'finance' | 'learning' | 'streak';
}

export interface FinanceOverview {
  balance: number;
  spent_this_month: number;
  budget_health: 'green' | 'yellow' | 'red';
  accounts: Array<{
    id: string;
    name: string;
    balance: number;
  }>;
  spending_by_category: Record<string, number>;
}

// ============================================
// DATABASE TYPE FOR SUPABASE CLIENT
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      user_domains: {
        Row: UserDomain;
        Insert: Omit<UserDomain, 'id' | 'created_at'>;
        Update: Partial<Omit<UserDomain, 'id' | 'user_id' | 'created_at'>>;
      };
      habits: {
        Row: Habit;
        Insert: Omit<Habit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>;
      };
      habit_logs: {
        Row: HabitLog;
        Insert: Omit<HabitLog, 'id' | 'created_at'>;
        Update: Partial<Omit<HabitLog, 'id' | 'habit_id' | 'created_at'>>;
      };
      accounts: {
        Row: Account;
        Insert: Omit<Account, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>;
      };
      category_budgets: {
        Row: CategoryBudget;
        Insert: Omit<CategoryBudget, 'id' | 'created_at'>;
        Update: Partial<Omit<CategoryBudget, 'id' | 'user_id' | 'created_at'>>;
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>;
      };
      workouts: {
        Row: Workout;
        Insert: Omit<Workout, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workout, 'id' | 'user_id' | 'created_at'>>;
      };
      exercise_logs: {
        Row: ExerciseLog;
        Insert: Omit<ExerciseLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ExerciseLog, 'id' | 'workout_id' | 'created_at'>>;
      };
      learning_logs: {
        Row: LearningLog;
        Insert: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LearningLog, 'id' | 'user_id' | 'created_at'>>;
      };
      daily_reflections: {
        Row: DailyReflection;
        Insert: Omit<DailyReflection, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyReflection, 'id' | 'user_id' | 'created_at'>>;
      };
      discipline_scores: {
        Row: DisciplineScore;
        Insert: Omit<DisciplineScore, 'id' | 'created_at'>;
        Update: Partial<Omit<DisciplineScore, 'id' | 'user_id' | 'created_at'>>;
      };
      streaks: {
        Row: Streak;
        Insert: Omit<Streak, 'id' | 'updated_at'>;
        Update: Partial<Omit<Streak, 'id' | 'user_id'>>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyLog, 'id' | 'user_id' | 'created_at'>>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>;
      };
      investment_portfolio: {
        Row: InvestmentPortfolio;
        Insert: Omit<InvestmentPortfolio, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InvestmentPortfolio, 'id' | 'user_id' | 'created_at'>>;
      };
      weekly_scorecards: {
        Row: WeeklyScorecard;
        Insert: Omit<WeeklyScorecard, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WeeklyScorecard, 'id' | 'user_id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
