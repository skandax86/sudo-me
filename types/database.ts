    // Database types for Supabase/PostgreSQL

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
  total_xp: number;
  level: string;
  // Onboarding & Personalization
  onboarding_complete: boolean;
  preferences: UserPreferences | null;
  generated_plan: GeneratedPlan | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  // Primary Focus
  primaryFocus: string;
  
  // Goals
  specificGoals: string[];
  customGoals: string[];
  
  // Current Situation
  currentLevel: string;
  biggestChallenge: string;
  
  // Commitment
  hoursPerDay: number;
  daysPerWeek: number;
  planDuration: number;
  
  // Schedule
  wakeUpTime: string;
  sleepTime: string;
  workSchedule: string;
  age: number;
  
  // Tracking
  trackingAreas: string[];
  customTracking: string[];
  
  // Budget
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

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: 'Essentials' | 'Wants' | 'Investments' | 'Savings' | 'Goals';
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

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

export interface Workout {
  id: string;
  user_id: string;
  workout_date: string;
  workout_type: 'Gym' | 'Run' | 'Calisthenics' | 'Swim' | 'Rest';
  duration_mins: number | null;
  // Gym specific
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }> | null;
  // Running specific
  distance_km: number | null;
  pace_min_per_km: number | null;
  // Calisthenics specific
  pull_ups: number | null;
  push_ups: number | null;
  l_sit_seconds: number | null;
  // General
  notes: string | null;
  goal_progress: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface Notification {
  id: string;
  user_id: string;
  type: 'coaching_tip' | 'budget_alert' | 'streak_milestone' | 'goal_reminder';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyLog, 'id' | 'user_id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>;
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>;
      };
      investment_portfolio: {
        Row: InvestmentPortfolio;
        Insert: Omit<InvestmentPortfolio, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InvestmentPortfolio, 'id' | 'user_id' | 'created_at'>>;
      };
      workouts: {
        Row: Workout;
        Insert: Omit<Workout, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workout, 'id' | 'user_id' | 'created_at'>>;
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
