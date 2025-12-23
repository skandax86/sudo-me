-- ============================================
-- Migration 004: MVP Schema Upgrade
-- Normalized, production-ready structure
-- ============================================

-- ============================================
-- 1. USER DOMAINS (Track which domains user selected)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL CHECK (domain IN ('health', 'finance', 'learning', 'discipline', 'career', 'personal')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

-- ============================================
-- 2. ACCOUNTS (Finance - TrackWallet style)
-- ============================================
CREATE TABLE IF NOT EXISTS public.accounts (
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
-- 3. UPGRADE TRANSACTIONS (Add account reference)
-- ============================================
-- Add new columns to existing transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id),
ADD COLUMN IF NOT EXISTS datetime TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS amount_inr NUMERIC(12,2);

-- Update category constraint to new values
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
    CHECK (type IN ('income', 'expense', 'transfer', 'Income', 'Expense'));

-- Add more flexible categories
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_category_check;
-- No constraint - allow flexible categories

-- ============================================
-- 4. CATEGORY BUDGETS (Per-category monthly limits)
-- ============================================
CREATE TABLE IF NOT EXISTS public.category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of month (2025-08-01)
    category TEXT NOT NULL,
    limit_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month, category)
);

-- ============================================
-- 5. HABITS (Flexible, user-defined)
-- ============================================
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '✅',
    weight INT DEFAULT 10 CHECK (weight BETWEEN 1 AND 100),
    domain TEXT DEFAULT 'discipline' CHECK (domain IN ('health', 'discipline', 'learning', 'personal')),
    active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. HABIT LOGS (Daily completions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, date)
);

-- ============================================
-- 7. EXERCISE LOGS (Normalized from workouts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise TEXT NOT NULL,
    sets INT,
    reps INT,
    weight NUMERIC(6,2),
    unit TEXT DEFAULT 'kg',
    duration_sec INT, -- For timed exercises
    distance_m NUMERIC(8,2), -- For cardio
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. UPGRADE WORKOUTS TABLE
-- ============================================
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS program TEXT, -- push/pull/legs/full/upper/lower
ADD COLUMN IF NOT EXISTS calories INT,
ADD COLUMN IF NOT EXISTS effort INT CHECK (effort BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Update workout_type constraint
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_workout_type_check;
ALTER TABLE public.workouts ADD CONSTRAINT workouts_workout_type_check 
    CHECK (workout_type IN ('gym', 'cardio', 'yoga', 'swim', 'rest', 'calisthenics', 'Gym', 'Run', 'Calisthenics', 'Swim', 'Rest'));

-- ============================================
-- 9. LEARNING LOGS (Separate from daily logs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_logs (
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
-- 10. DAILY REFLECTIONS (Personal domain)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_reflections (
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
-- 11. DISCIPLINE SCORES (Cached daily scores)
-- ============================================
CREATE TABLE IF NOT EXISTS public.discipline_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    habits_score INT DEFAULT 0,
    fitness_score INT DEFAULT 0,
    learning_score INT DEFAULT 0,
    finance_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    habits_data JSONB, -- { completed: 4, total: 5 }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- 12. STREAKS TABLE (Track streak history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.streaks (
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
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_domains_user ON public.user_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON public.habits(user_id, active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout ON public.exercise_logs(workout_id);
CREATE INDEX IF NOT EXISTS idx_learning_logs_user_date ON public.learning_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON public.daily_reflections(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_discipline_scores_user_date ON public.discipline_scores(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_month ON public.category_budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_transactions_datetime ON public.transactions(datetime DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.user_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Users can manage own domains" ON public.user_domains
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own accounts" ON public.accounts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit logs" ON public.habit_logs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise logs" ON public.exercise_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workouts w 
            WHERE w.id = exercise_logs.workout_id 
            AND w.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own learning logs" ON public.learning_logs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own reflections" ON public.daily_reflections
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own scores" ON public.discipline_scores
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own category budgets" ON public.category_budgets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks" ON public.streaks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_logs_updated_at BEFORE UPDATE ON public.learning_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_reflections_updated_at BEFORE UPDATE ON public.daily_reflections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT HABITS (Created on user signup)
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_habits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.habits (user_id, name, icon, weight, domain, sort_order) VALUES
        (NEW.id, 'Wake up on time', '⏰', 15, 'discipline', 1),
        (NEW.id, 'Cold shower', '🚿', 10, 'discipline', 2),
        (NEW.id, 'No phone first hour', '📵', 10, 'discipline', 3),
        (NEW.id, 'Meditate', '🧘', 10, 'personal', 4),
        (NEW.id, 'Plan tomorrow', '📝', 10, 'discipline', 5);
    
    -- Create streak record
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (NEW.id, 0, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default habits when profile is created
DROP TRIGGER IF EXISTS on_profile_created_habits ON public.profiles;
CREATE TRIGGER on_profile_created_habits
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_habits();

-- ============================================
-- FUNCTION: Calculate Daily Discipline Score
-- ============================================
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
    v_habits_completed INT;
    v_habits_total INT;
    v_habits_weighted NUMERIC;
    v_habits_max_weight NUMERIC;
    v_habit_score INT;
    v_fitness_score INT;
    v_learning_score INT;
BEGIN
    -- 1. Calculate Habits Score (60% of total, weighted)
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
    
    -- 2. Calculate Fitness Score (20% of total)
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.workouts w 
                WHERE w.user_id = p_user_id 
                AND w.workout_date = p_date 
                AND w.workout_type != 'rest'
            ) THEN 20
            WHEN EXISTS (
                SELECT 1 FROM public.workouts w 
                WHERE w.user_id = p_user_id 
                AND w.workout_date = p_date 
                AND w.workout_type = 'rest'
            ) THEN 10 -- Planned rest day
            ELSE 0
        END
    INTO v_fitness_score;
    
    -- 3. Calculate Learning Score (20% of total)
    SELECT 
        LEAST(20, 
            COALESCE(leetcode_solved * 5, 0) + 
            COALESCE(FLOOR(study_hours * 4), 0) +
            COALESCE(FLOOR(pages_read / 5), 0)
        )
    INTO v_learning_score
    FROM public.learning_logs
    WHERE user_id = p_user_id AND date = p_date;
    
    IF v_learning_score IS NULL THEN
        v_learning_score := 0;
    END IF;
    
    RETURN QUERY SELECT 
        v_habit_score,
        v_fitness_score,
        v_learning_score,
        v_habit_score + v_fitness_score + v_learning_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update Account Balance on Transaction
-- ============================================
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.account_id IS NOT NULL THEN
            UPDATE public.accounts 
            SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.account_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.account_id IS NOT NULL THEN
            UPDATE public.accounts 
            SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.account_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.account_id IS NOT NULL AND OLD.account_id != NEW.account_id THEN
            UPDATE public.accounts 
            SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.account_id;
        END IF;
        IF NEW.account_id IS NOT NULL THEN
            UPDATE public.accounts 
            SET current_balance = current_balance + NEW.amount - COALESCE(
                CASE WHEN OLD.account_id = NEW.account_id THEN OLD.amount ELSE 0 END, 0
            )
            WHERE id = NEW.account_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_balance_update
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

