-- Personal Development System (PDS) Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    wake_time TIME DEFAULT '06:00:00',
    start_date DATE DEFAULT CURRENT_DATE,
    long_term_goals TEXT[] DEFAULT '{}',
    
    -- Profile settings
    target_weight DECIMAL(5,2),
    salary DECIMAL(12,2),
    
    -- Gamification
    current_streak INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Beginner',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. DAILY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    
    -- Habits
    woke_up_at_6am BOOLEAN DEFAULT FALSE,
    cold_shower BOOLEAN DEFAULT FALSE,
    no_phone_first_hour BOOLEAN DEFAULT FALSE,
    meditated BOOLEAN DEFAULT FALSE,
    planned_tomorrow BOOLEAN DEFAULT FALSE,
    
    -- Fitness
    workout_type TEXT CHECK (workout_type IN ('Gym', 'Run', 'Calisthenics', 'Swim', 'Rest')),
    water_intake_oz INTEGER DEFAULT 0,
    sleep_hours DECIMAL(3,1),
    
    -- Learning
    leetcode_solved INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    study_hours DECIMAL(3,1) DEFAULT 0,
    
    -- Journal
    impulse_control_rating INTEGER CHECK (impulse_control_rating BETWEEN 1 AND 5),
    notes TEXT,
    
    -- Calculated score
    discipline_score INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one log per user per day
    UNIQUE(user_id, log_date)
);

-- ============================================
-- 3. TRANSACTIONS TABLE (Finance)
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
    category TEXT NOT NULL CHECK (category IN ('Essentials', 'Wants', 'Investments', 'Savings', 'Goals')),
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    timeframe TEXT NOT NULL CHECK (timeframe IN ('short', 'mid', 'long')),
    category TEXT NOT NULL CHECK (category IN ('Finance', 'Fitness', 'Career', 'Learning', 'Personal', 'Travel')),
    target_value DECIMAL(12,2),
    current_value DECIMAL(12,2) DEFAULT 0,
    unit TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    due_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. BUDGETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    month DATE NOT NULL, -- First day of the month
    essentials_limit DECIMAL(12,2) DEFAULT 30000,
    wants_limit DECIMAL(12,2) DEFAULT 10000,
    investments_target DECIMAL(12,2) DEFAULT 20000,
    savings_target DECIMAL(12,2) DEFAULT 20000,
    goals_target DECIMAL(12,2) DEFAULT 15000,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one budget per user per month
    UNIQUE(user_id, month)
);

-- ============================================
-- 6. INVESTMENT PORTFOLIO TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.investment_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    month DATE NOT NULL,
    total_invested DECIMAL(12,2) DEFAULT 0,
    low_risk_amount DECIMAL(12,2) DEFAULT 0,
    mid_risk_amount DECIMAL(12,2) DEFAULT 0,
    high_risk_amount DECIMAL(12,2) DEFAULT 0,
    emergency_fund_balance DECIMAL(12,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, month)
);

-- ============================================
-- 7. WORKOUTS TABLE (Detailed)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    workout_date DATE NOT NULL,
    workout_type TEXT NOT NULL CHECK (workout_type IN ('Gym', 'Run', 'Calisthenics', 'Swim', 'Rest')),
    duration_mins INTEGER,
    
    -- Gym specific
    exercises JSONB, -- Array of {name, sets, reps, weight}
    
    -- Running specific
    distance_km DECIMAL(5,2),
    pace_min_per_km DECIMAL(4,2),
    
    -- Calisthenics specific
    pull_ups INTEGER,
    push_ups INTEGER,
    l_sit_seconds INTEGER,
    
    -- General
    notes TEXT,
    goal_progress TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. WEEKLY SCORECARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- Scores
    fitness_score INTEGER DEFAULT 0,
    discipline_score INTEGER DEFAULT 0,
    skills_score INTEGER DEFAULT 0,
    finance_score INTEGER DEFAULT 0,
    career_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    
    -- Metrics
    workouts_completed INTEGER DEFAULT 0,
    discipline_days INTEGER DEFAULT 0,
    leetcode_solved INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    amount_invested DECIMAL(12,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, week_start)
);

-- ============================================
-- 9. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('coaching_tip', 'budget_alert', 'streak_milestone', 'goal_reminder')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily Logs: Users can only access their own logs
CREATE POLICY "Users can view own daily logs" ON public.daily_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs" ON public.daily_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs" ON public.daily_logs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily logs" ON public.daily_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions: Users can only access their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Goals: Users can only access their own goals
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets: Users can only access their own budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

-- Investment Portfolio: Users can only access their own portfolio
CREATE POLICY "Users can view own portfolio" ON public.investment_portfolio
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON public.investment_portfolio
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON public.investment_portfolio
    FOR UPDATE USING (auth.uid() = user_id);

-- Workouts: Users can only access their own workouts
CREATE POLICY "Users can view own workouts" ON public.workouts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.workouts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Weekly Scorecards: Users can only access their own scorecards
CREATE POLICY "Users can view own scorecards" ON public.weekly_scorecards
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scorecards" ON public.weekly_scorecards
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scorecards" ON public.weekly_scorecards
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: Users can only access their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investment_portfolio_updated_at BEFORE UPDATE ON public.investment_portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_scorecards_updated_at BEFORE UPDATE ON public.weekly_scorecards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();




