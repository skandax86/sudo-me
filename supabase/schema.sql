-- ============================================
-- SUDO-ME / TRACKY - Master Schema
-- Version: 2.0 (MVP + Challenge System)
-- 
-- Run this to set up fresh database:
-- 1. Drop all tables (if needed)
-- 2. Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (for clean reset)
-- ============================================
DROP TABLE IF EXISTS public.challenge_daily_logs CASCADE;
DROP TABLE IF EXISTS public.challenge_sessions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.weekly_scorecards CASCADE;
DROP TABLE IF EXISTS public.discipline_scores CASCADE;
DROP TABLE IF EXISTS public.streaks CASCADE;
DROP TABLE IF EXISTS public.daily_reflections CASCADE;
DROP TABLE IF EXISTS public.learning_logs CASCADE;
DROP TABLE IF EXISTS public.exercise_logs CASCADE;
DROP TABLE IF EXISTS public.habit_logs CASCADE;
DROP TABLE IF EXISTS public.habits CASCADE;
DROP TABLE IF EXISTS public.category_budgets CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.workouts CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.investment_portfolio CASCADE;
DROP TABLE IF EXISTS public.user_domains CASCADE;
DROP TABLE IF EXISTS public.daily_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_habits() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_discipline_score(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.update_account_balance() CASCADE;
DROP FUNCTION IF EXISTS public.increment_xp(UUID, INT) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.validate_challenge_day(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.get_active_challenge(UUID) CASCADE;

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    
    -- Settings
    wake_time TIME DEFAULT '06:00:00',
    start_date DATE DEFAULT CURRENT_DATE,
    
    -- Gamification
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    level TEXT DEFAULT 'Beginner',
    
    -- Challenge / Template
    template_type TEXT DEFAULT 'custom' CHECK (template_type IN ('75_hard', '75_soft', 'custom')),
    
    -- Onboarding
    onboarding_complete BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    generated_plan JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USER DOMAINS (which domains user tracks)
-- ============================================
CREATE TABLE public.user_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL CHECK (domain IN ('health', 'finance', 'learning', 'discipline', 'career', 'personal')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

-- ============================================
-- 3. HABITS (flexible, user-defined)
-- ============================================
CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '✅',
    weight INT DEFAULT 10 CHECK (weight BETWEEN 1 AND 100),
    domain TEXT DEFAULT 'discipline' CHECK (domain IN ('health', 'discipline', 'learning', 'personal', 'career', 'finance')),
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    target_per_period INT DEFAULT 1, -- e.g., 4x per week, 2x per month
    active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. HABIT LOGS (daily completions)
-- ============================================
CREATE TABLE public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, date)
);

-- ============================================
-- 5. ACCOUNTS (Finance - bank, cash, wallet)
-- ============================================
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'wallet', 'credit')),
    currency TEXT DEFAULT 'INR',
    opening_balance NUMERIC(12,2) DEFAULT 0,
    current_balance NUMERIC(12,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. TRANSACTIONS (income/expense/transfer)
-- ============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    account_id UUID REFERENCES public.accounts(id),
    amount NUMERIC(12,2) NOT NULL,
    amount_inr NUMERIC(12,2) NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    note TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. CATEGORY BUDGETS (per-category monthly limits)
-- ============================================
CREATE TABLE public.category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day (2025-08-01)
    category TEXT NOT NULL,
    limit_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month, category)
);

-- ============================================
-- 8. INVESTMENTS / HOLDINGS (SIPs, Stocks, ETFs, Crypto)
-- ============================================
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Nifty 50 ETF", "Kalyan Jewellers", "BTC"
    symbol TEXT, -- "NIFTYBEES", "KALYANJL", "BTC"
    category TEXT NOT NULL CHECK (category IN ('etf', 'stock', 'mutual_fund', 'gold', 'silver', 'crypto', 'fd', 'rd', 'nps', 'ppf', 'other')),
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    platform TEXT, -- "Groww", "Zerodha", "Bank"
    units NUMERIC(12,4) DEFAULT 0,
    avg_buy_price NUMERIC(12,2) DEFAULT 0,
    current_price NUMERIC(12,2) DEFAULT 0,
    invested_amount NUMERIC(12,2) DEFAULT 0,
    current_value NUMERIC(12,2) DEFAULT 0,
    is_sip BOOLEAN DEFAULT FALSE,
    sip_amount NUMERIC(12,2),
    sip_date INT, -- Day of month (1-28)
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. INVESTMENT TRANSACTIONS (buy/sell/dividend)
-- ============================================
CREATE TABLE public.investment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'sip')),
    units NUMERIC(12,4) NOT NULL,
    price_per_unit NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    fees NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. RECURRING TRANSACTIONS (SIPs, Subscriptions, EMIs)
-- ============================================
CREATE TABLE public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Netflix", "Gym SIP", "Term Insurance"
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment')),
    category TEXT NOT NULL,
    subcategory TEXT,
    amount NUMERIC(12,2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    day_of_period INT, -- Day of month/week
    account_id UUID REFERENCES public.accounts(id),
    investment_id UUID REFERENCES public.investments(id),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL = ongoing
    next_due DATE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_log BOOLEAN DEFAULT FALSE, -- Auto-create transaction on due date
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. BUDGET MASTER (hierarchical budget planning)
-- ============================================
CREATE TABLE public.budget_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    year INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- High-level allocations (your 5-bucket system)
    essential_needs NUMERIC(12,2) DEFAULT 0,
    desires_wants NUMERIC(12,2) DEFAULT 0,
    investments NUMERIC(12,2) DEFAULT 0,
    savings_emergency NUMERIC(12,2) DEFAULT 0,
    short_mid_goals NUMERIC(12,2) DEFAULT 0,
    
    total_income NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, year, month)
);

-- ============================================
-- 12. BUDGET SUBCATEGORIES (detailed breakdown)
-- ============================================
CREATE TABLE public.budget_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
    parent_category TEXT NOT NULL CHECK (parent_category IN ('essential_needs', 'desires_wants', 'investments', 'savings_emergency', 'short_mid_goals')),
    name TEXT NOT NULL, -- "Rent", "Commute", "Food"
    planned_amount NUMERIC(12,2) NOT NULL,
    spent_amount NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. NET WORTH SNAPSHOTS (monthly tracking)
-- ============================================
CREATE TABLE public.net_worth_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    
    -- Assets
    bank_balance NUMERIC(12,2) DEFAULT 0,
    cash NUMERIC(12,2) DEFAULT 0,
    investments_value NUMERIC(12,2) DEFAULT 0,
    other_assets NUMERIC(12,2) DEFAULT 0,
    
    -- Liabilities
    loans NUMERIC(12,2) DEFAULT 0,
    credit_card_debt NUMERIC(12,2) DEFAULT 0,
    other_liabilities NUMERIC(12,2) DEFAULT 0,
    
    -- Calculated
    total_assets NUMERIC(12,2) DEFAULT 0,
    total_liabilities NUMERIC(12,2) DEFAULT 0,
    net_worth NUMERIC(12,2) DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, snapshot_date)
);

-- ============================================
-- 14. WORKOUTS (fitness logging)
-- ============================================
CREATE TABLE public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    workout_type TEXT NOT NULL CHECK (workout_type IN ('gym', 'cardio', 'yoga', 'swim', 'rest', 'calisthenics')),
    program TEXT, -- push/pull/legs/full/upper/lower
    duration_mins INT,
    calories INT,
    effort INT CHECK (effort BETWEEN 1 AND 10),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, workout_date)
);

-- ============================================
-- 9. EXERCISE LOGS (individual exercises)
-- ============================================
CREATE TABLE public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise TEXT NOT NULL,
    sets INT,
    reps INT,
    weight NUMERIC(6,2),
    unit TEXT DEFAULT 'kg',
    duration_sec INT,
    distance_m NUMERIC(8,2),
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. LEARNING LOGS (daily learning)
-- ============================================
CREATE TABLE public.learning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    leetcode_solved INT DEFAULT 0,
    pages_read INT DEFAULT 0,
    study_hours NUMERIC(4,2) DEFAULT 0,
    topic TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- 11. DAILY REFLECTIONS (personal/journal)
-- ============================================
CREATE TABLE public.daily_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impulse_rating INT CHECK (impulse_rating BETWEEN 1 AND 5),
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    mood INT CHECK (mood BETWEEN 1 AND 5),
    gratitude TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- 12. DISCIPLINE SCORES (cached daily scores)
-- ============================================
CREATE TABLE public.discipline_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    habits_score INT DEFAULT 0,
    fitness_score INT DEFAULT 0,
    learning_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    habits_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- 13. STREAKS (track streak history)
-- ============================================
CREATE TABLE public.streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_log_date DATE,
    forgiveness_used_this_month INT DEFAULT 0,
    streak_started_at DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- 14. GOALS (long-term goals)
-- ============================================
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    timeframe TEXT NOT NULL CHECK (timeframe IN ('short', 'mid', 'long')),
    domain TEXT NOT NULL CHECK (domain IN ('health', 'finance', 'learning', 'discipline', 'career', 'personal')),
    target_value NUMERIC(12,2),
    current_value NUMERIC(12,2) DEFAULT 0,
    unit TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. DAILY LOGS (legacy unified log table)
-- ============================================
CREATE TABLE public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    
    -- Habits (legacy format)
    woke_up_at_6am BOOLEAN DEFAULT FALSE,
    cold_shower BOOLEAN DEFAULT FALSE,
    no_phone_first_hour BOOLEAN DEFAULT FALSE,
    meditated BOOLEAN DEFAULT FALSE,
    planned_tomorrow BOOLEAN DEFAULT FALSE,
    
    -- Fitness
    workout_type TEXT,
    water_intake_oz INT DEFAULT 0,
    sleep_hours NUMERIC(4,2) DEFAULT 7,
    
    -- Learning
    leetcode_solved INT DEFAULT 0,
    pages_read INT DEFAULT 0,
    study_hours NUMERIC(4,2) DEFAULT 0,
    
    -- Personal
    impulse_control_rating INT CHECK (impulse_control_rating BETWEEN 1 AND 5),
    notes TEXT,
    
    -- Calculated
    discipline_score INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ============================================
-- 16. NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('coaching_tip', 'budget_alert', 'streak_milestone', 'goal_reminder', 'achievement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. CHALLENGE SESSIONS (75 Hard / 75 Soft)
-- ============================================
CREATE TABLE public.challenge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('75_hard', '75_soft')),
    start_date DATE NOT NULL,
    current_day INT DEFAULT 1 CHECK (current_day BETWEEN 1 AND 75),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
    failed_at DATE,
    completed_at DATE,
    restart_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. CHALLENGE DAILY LOGS
-- ============================================
CREATE TABLE public.challenge_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.challenge_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 75),
    
    -- 75 Hard specific tasks
    workout_1_done BOOLEAN DEFAULT FALSE,
    workout_2_outdoor_done BOOLEAN DEFAULT FALSE,
    diet_followed BOOLEAN DEFAULT FALSE,
    water_goal_done BOOLEAN DEFAULT FALSE,
    reading_done BOOLEAN DEFAULT FALSE,
    progress_photo BOOLEAN DEFAULT FALSE,
    no_alcohol BOOLEAN DEFAULT FALSE,
    
    -- 75 Soft specific
    reflection_done BOOLEAN DEFAULT FALSE,
    
    -- Status
    all_tasks_complete BOOLEAN DEFAULT FALSE,
    passed BOOLEAN,  -- NULL = not validated, TRUE = passed, FALSE = failed
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, date)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_habits_user_active ON public.habits(user_id, active);
CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, date DESC);
CREATE INDEX idx_habit_logs_habit_date ON public.habit_logs(habit_id, date DESC);
CREATE INDEX idx_accounts_user ON public.accounts(user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_datetime ON public.transactions(datetime DESC);
CREATE INDEX idx_category_budgets_user_month ON public.category_budgets(user_id, month);
CREATE INDEX idx_investments_user_category ON public.investments(user_id, category);
CREATE INDEX idx_investments_user_active ON public.investments(user_id) WHERE active = TRUE;
CREATE INDEX idx_investment_transactions_user_date ON public.investment_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_investment_transactions_investment ON public.investment_transactions(investment_id);
CREATE INDEX idx_recurring_transactions_user_active ON public.recurring_transactions(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_recurring_transactions_next_due ON public.recurring_transactions(next_due) WHERE is_active = TRUE;
CREATE INDEX idx_budget_plans_user_period ON public.budget_plans(user_id, year, month);
CREATE INDEX idx_budget_subcategories_plan ON public.budget_subcategories(budget_plan_id);
CREATE INDEX idx_net_worth_snapshots_user_date ON public.net_worth_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_workouts_user_date ON public.workouts(user_id, workout_date DESC);
CREATE INDEX idx_exercise_logs_workout ON public.exercise_logs(workout_id);
CREATE INDEX idx_learning_logs_user_date ON public.learning_logs(user_id, date DESC);
CREATE INDEX idx_daily_reflections_user_date ON public.daily_reflections(user_id, date DESC);
CREATE INDEX idx_discipline_scores_user_date ON public.discipline_scores(user_id, date DESC);
CREATE INDEX idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_challenge_sessions_user ON public.challenge_sessions(user_id, status);
CREATE INDEX idx_challenge_daily_logs_session ON public.challenge_daily_logs(session_id, date DESC);
CREATE INDEX idx_challenge_daily_logs_user_date ON public.challenge_daily_logs(user_id, date DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simple: users access only their own data)
CREATE POLICY "Users own data" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own data" ON public.user_domains FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.category_budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.investments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.investment_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.recurring_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.budget_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.budget_subcategories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.net_worth_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.exercise_logs FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));
CREATE POLICY "Users own data" ON public.learning_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.daily_reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.discipline_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.challenge_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON public.challenge_daily_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default habits + streak on profile creation
CREATE OR REPLACE FUNCTION public.create_default_habits()
RETURNS TRIGGER AS $$
BEGIN
    -- Default habits
    INSERT INTO public.habits (user_id, name, icon, weight, domain, sort_order) VALUES
        (NEW.id, 'Wake up on time', '⏰', 15, 'discipline', 1),
        (NEW.id, 'Cold shower', '🚿', 10, 'discipline', 2),
        (NEW.id, 'No phone first hour', '📵', 10, 'discipline', 3),
        (NEW.id, 'Meditate', '🧘', 10, 'personal', 4),
        (NEW.id, 'Plan tomorrow', '📝', 10, 'discipline', 5);
    
    -- Create streak record
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (NEW.id, 0, 0);
    
    -- Default domains
    INSERT INTO public.user_domains (user_id, domain) VALUES
        (NEW.id, 'discipline'),
        (NEW.id, 'health'),
        (NEW.id, 'finance'),
        (NEW.id, 'learning');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate discipline score
CREATE OR REPLACE FUNCTION public.calculate_discipline_score(
    p_user_id UUID,
    p_date DATE
) RETURNS TABLE (
    habits_score INT,
    fitness_score INT,
    learning_score INT,
    total_score INT
) AS $$
DECLARE
    v_habits_weighted NUMERIC;
    v_habits_max_weight NUMERIC;
    v_habit_score INT;
    v_fitness_score INT;
    v_learning_score INT;
BEGIN
    -- 1. Habits Score (60% of total, weighted)
    SELECT 
        COALESCE(SUM(CASE WHEN hl.completed THEN h.weight ELSE 0 END), 0),
        COALESCE(SUM(h.weight), 0)
    INTO v_habits_weighted, v_habits_max_weight
    FROM public.habits h
    LEFT JOIN public.habit_logs hl ON h.id = hl.habit_id AND hl.date = p_date
    WHERE h.user_id = p_user_id AND h.active = TRUE;
    
    IF v_habits_max_weight > 0 THEN
        v_habit_score := ROUND((v_habits_weighted / v_habits_max_weight) * 60);
    ELSE
        v_habit_score := 0;
    END IF;
    
    -- 2. Fitness Score (20% of total)
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.workouts w 
                WHERE w.user_id = p_user_id 
                AND w.workout_date = p_date 
                AND w.workout_type != 'rest'
            ) THEN 
                15 + COALESCE((
                    SELECT ROUND(w.effort / 2) 
                    FROM public.workouts w 
                    WHERE w.user_id = p_user_id AND w.workout_date = p_date
                ), 0)
            WHEN EXISTS (
                SELECT 1 FROM public.workouts w 
                WHERE w.user_id = p_user_id 
                AND w.workout_date = p_date 
                AND w.workout_type = 'rest'
            ) THEN 10
            ELSE 0
        END
    INTO v_fitness_score;
    v_fitness_score := LEAST(v_fitness_score, 20);
    
    -- 3. Learning Score (20% of total)
    SELECT 
        LEAST(20, 
            COALESCE(leetcode_solved * 5, 0) + 
            COALESCE(FLOOR(study_hours * 4), 0) +
            COALESCE(FLOOR(pages_read::NUMERIC / 5), 0)
        )
    INTO v_learning_score
    FROM public.learning_logs
    WHERE user_id = p_user_id AND date = p_date;
    
    v_learning_score := COALESCE(v_learning_score, 0);
    
    RETURN QUERY SELECT 
        v_habit_score,
        v_fitness_score,
        v_learning_score,
        LEAST(v_habit_score + v_fitness_score + v_learning_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Update account balance on transaction
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.account_id IS NOT NULL THEN
        UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF TG_OP = 'DELETE' AND OLD.account_id IS NOT NULL THEN
        UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.account_id IS NOT NULL THEN
            UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
        END IF;
        IF NEW.account_id IS NOT NULL THEN
            UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Increment XP
CREATE OR REPLACE FUNCTION public.increment_xp(p_user_id UUID, p_xp_amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET total_xp = COALESCE(total_xp, 0) + p_xp_amount
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate challenge day
CREATE OR REPLACE FUNCTION public.validate_challenge_day(
    p_session_id UUID,
    p_date DATE
) RETURNS JSONB AS $$
DECLARE
    v_session RECORD;
    v_log RECORD;
    v_all_complete BOOLEAN;
    v_day_number INT;
BEGIN
    SELECT * INTO v_session FROM public.challenge_sessions WHERE id = p_session_id;
    
    IF v_session IS NULL THEN
        RETURN jsonb_build_object('error', 'Session not found');
    END IF;
    
    v_day_number := (p_date - v_session.start_date) + 1;
    
    IF v_day_number < 1 OR v_day_number > 75 THEN
        RETURN jsonb_build_object('error', 'Invalid day number', 'day', v_day_number);
    END IF;
    
    SELECT * INTO v_log 
    FROM public.challenge_daily_logs 
    WHERE session_id = p_session_id AND date = p_date;
    
    IF v_log IS NULL THEN
        INSERT INTO public.challenge_daily_logs (session_id, user_id, date, day_number)
        VALUES (p_session_id, v_session.user_id, p_date, v_day_number)
        RETURNING * INTO v_log;
    END IF;
    
    IF v_session.challenge_type = '75_hard' THEN
        v_all_complete := (
            v_log.workout_1_done AND
            v_log.workout_2_outdoor_done AND
            v_log.diet_followed AND
            v_log.water_goal_done AND
            v_log.reading_done AND
            v_log.progress_photo AND
            v_log.no_alcohol
        );
    ELSE
        v_all_complete := (
            v_log.workout_1_done AND
            v_log.diet_followed AND
            v_log.water_goal_done AND
            v_log.reading_done
        );
    END IF;
    
    UPDATE public.challenge_daily_logs
    SET all_tasks_complete = v_all_complete,
        passed = v_all_complete
    WHERE id = v_log.id;
    
    IF v_session.challenge_type = '75_hard' AND NOT v_all_complete AND v_day_number > 0 THEN
        UPDATE public.challenge_sessions
        SET status = 'failed',
            failed_at = p_date
        WHERE id = p_session_id;
    END IF;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'day_number', v_day_number,
        'all_complete', v_all_complete,
        'challenge_type', v_session.challenge_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active challenge
CREATE OR REPLACE FUNCTION public.get_active_challenge(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_session RECORD;
    v_today_log RECORD;
    v_day_number INT;
BEGIN
    SELECT * INTO v_session 
    FROM public.challenge_sessions 
    WHERE user_id = p_user_id AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_session IS NULL THEN
        RETURN jsonb_build_object('active', FALSE);
    END IF;
    
    v_day_number := (CURRENT_DATE - v_session.start_date) + 1;
    
    SELECT * INTO v_today_log
    FROM public.challenge_daily_logs
    WHERE session_id = v_session.id AND date = CURRENT_DATE;
    
    RETURN jsonb_build_object(
        'active', TRUE,
        'session_id', v_session.id,
        'challenge_type', v_session.challenge_type,
        'start_date', v_session.start_date,
        'current_day', v_day_number,
        'total_days', 75,
        'restart_count', v_session.restart_count,
        'today_log', CASE WHEN v_today_log IS NOT NULL THEN 
            jsonb_build_object(
                'workout_1_done', v_today_log.workout_1_done,
                'workout_2_outdoor_done', v_today_log.workout_2_outdoor_done,
                'diet_followed', v_today_log.diet_followed,
                'water_goal_done', v_today_log.water_goal_done,
                'reading_done', v_today_log.reading_done,
                'progress_photo', v_today_log.progress_photo,
                'no_alcohol', v_today_log.no_alcohol,
                'reflection_done', v_today_log.reflection_done,
                'all_tasks_complete', v_today_log.all_tasks_complete
            )
        ELSE NULL END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_profile_created_habits
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_habits();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at 
    BEFORE UPDATE ON public.habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at 
    BEFORE UPDATE ON public.investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at 
    BEFORE UPDATE ON public.recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_plans_updated_at 
    BEFORE UPDATE ON public.budget_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at 
    BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_logs_updated_at 
    BEFORE UPDATE ON public.learning_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reflections_updated_at 
    BEFORE UPDATE ON public.daily_reflections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at 
    BEFORE UPDATE ON public.streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at 
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at 
    BEFORE UPDATE ON public.daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_sessions_updated_at 
    BEFORE UPDATE ON public.challenge_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_daily_logs_updated_at 
    BEFORE UPDATE ON public.challenge_daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_transaction_balance_update
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

-- ============================================
-- DONE! Database ready.
-- 17 Tables | Full RLS | Challenge System
-- ============================================
