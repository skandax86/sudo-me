-- ============================================
-- BHAGM's 2025 Goals & Habits Seed
-- Run this after schema.sql
-- ============================================

-- Get the user ID (replace with your actual ID if different)
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get first user (your account)
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found. Please sign up first.';
    END IF;

    -- ==========================================
    -- CLEAR EXISTING HABITS & GOALS (fresh start)
    -- ==========================================
    DELETE FROM public.habit_logs WHERE habit_id IN (SELECT id FROM public.habits WHERE user_id = v_user_id);
    DELETE FROM public.habits WHERE user_id = v_user_id;
    DELETE FROM public.goals WHERE user_id = v_user_id;

    -- ==========================================
    -- DAILY HABITS (7 days/week)
    -- ==========================================
    INSERT INTO public.habits (user_id, name, icon, weight, domain, frequency, target_per_period, sort_order) VALUES
    -- Morning Routine
    (v_user_id, 'Wake up at 6 AM', '⏰', 15, 'discipline', 'daily', 1, 1),
    (v_user_id, 'No phone 1st hour', '📵', 10, 'discipline', 'daily', 1, 2),
    (v_user_id, 'Cold shower', '🚿', 10, 'discipline', 'daily', 1, 3),
    (v_user_id, 'Meditate 10 mins', '🧘', 10, 'personal', 'daily', 1, 4),
    
    -- Health Daily
    (v_user_id, 'Drink gallon of water', '💧', 10, 'health', 'daily', 1, 5),
    (v_user_id, 'Eat fresh / Cook', '🥗', 10, 'health', 'daily', 1, 6),
    
    -- Evening Routine
    (v_user_id, 'Plan tomorrow (5 mins)', '📝', 10, 'discipline', 'daily', 1, 7),
    (v_user_id, 'Self control maintained', '🧠', 15, 'discipline', 'daily', 1, 8);

    -- ==========================================
    -- WEEKLY HABITS (X times per week)
    -- ==========================================
    INSERT INTO public.habits (user_id, name, icon, weight, domain, frequency, target_per_period, sort_order) VALUES
    -- Fitness
    (v_user_id, 'Hit Gym', '🏋️', 15, 'health', 'weekly', 4, 10),
    (v_user_id, 'Running', '🏃', 10, 'health', 'weekly', 2, 11),
    
    -- Health
    (v_user_id, 'Intermittent Fasting', '🍽️', 10, 'health', 'weekly', 1, 12),
    
    -- Personal
    (v_user_id, 'Journal entry', '📓', 10, 'personal', 'weekly', 1, 13);

    -- ==========================================
    -- MONTHLY LIMITS (Max X per month)
    -- ==========================================
    INSERT INTO public.habits (user_id, name, icon, weight, domain, frequency, target_per_period, sort_order) VALUES
    (v_user_id, 'Alcohol (max 2/month)', '🍺', 5, 'health', 'monthly', 2, 20);

    -- ==========================================
    -- 2025 MILESTONE GOALS
    -- ==========================================
    INSERT INTO public.goals (user_id, title, description, domain, timeframe, target_value, current_value, unit, due_date, status) VALUES
    -- Career (Long-term)
    (v_user_id, 'Switch Job - 20 LPA or Amsterdam', 'Get a new job with 20 LPA salary or relocate to Amsterdam', 'career', 'long', 1, 0, 'milestone', '2025-12-31', 'active'),
    
    -- Learning Certifications (Mid-term)
    (v_user_id, 'AWS Certificate', 'Complete AWS Solutions Architect certification', 'learning', 'mid', 1, 0, 'certificate', '2025-06-30', 'active'),
    (v_user_id, 'Databricks Certificate', 'Complete Databricks certification', 'learning', 'mid', 1, 0, 'certificate', '2025-09-30', 'active'),
    
    -- Finance (Long-term)
    (v_user_id, 'Build 5L Assets', 'Accumulate assets worth minimum 5 Lakhs', 'finance', 'long', 500000, 0, 'INR', '2025-12-31', 'active'),
    
    -- Learning Counters (Long-term)
    (v_user_id, 'Solve 200-300 LeetCode', 'Complete 200-300 LeetCode problems for interview prep', 'learning', 'long', 250, 0, 'problems', '2025-12-31', 'active'),
    (v_user_id, 'Read 12 Books', 'Read 12 books this year (1 per month)', 'learning', 'long', 12, 0, 'books', '2025-12-31', 'active'),
    
    -- Fitness/Skills (Short/Mid-term)
    (v_user_id, 'Learn Swimming', 'Learn to swim properly', 'health', 'mid', 1, 0, 'skill', '2025-06-30', 'active'),
    (v_user_id, 'Start Calisthenics', 'Begin calisthenics training program', 'health', 'short', 1, 0, 'milestone', '2025-03-31', 'active'),
    (v_user_id, 'Join Ninja Classes', 'Enroll in ninja/parkour classes', 'health', 'short', 1, 0, 'milestone', '2025-04-30', 'active'),
    
    -- Travel (Long-term)
    (v_user_id, '3 Domestic Trips', 'Complete 3 domestic trips', 'personal', 'long', 3, 0, 'trips', '2025-12-31', 'active'),
    (v_user_id, '1 International Trip', 'Complete 1 international trip', 'personal', 'long', 1, 0, 'trips', '2025-12-31', 'active');

    -- ==========================================
    -- ENABLE ALL DOMAINS
    -- ==========================================
    DELETE FROM public.domains WHERE user_id = v_user_id;
    INSERT INTO public.domains (user_id, domain, active) VALUES
    (v_user_id, 'health', true),
    (v_user_id, 'finance', true),
    (v_user_id, 'learning', true),
    (v_user_id, 'discipline', true),
    (v_user_id, 'career', true),
    (v_user_id, 'personal', true);

    RAISE NOTICE 'Successfully seeded goals for user: %', v_user_id;
END $$;

-- Verify the data
SELECT 'Habits' as type, COUNT(*) as count FROM public.habits
UNION ALL
SELECT 'Goals' as type, COUNT(*) as count FROM public.goals
UNION ALL
SELECT 'Domains' as type, COUNT(*) as count FROM public.domains;

