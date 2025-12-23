-- Seed data for existing users
-- Run this ONCE after applying schema.sql
-- 
-- The schema DROP removed profiles, but auth.users still has the user
-- We need to recreate the profile first

-- Step 1: Recreate profile from auth.users
INSERT INTO public.profiles (id, email, name, timezone, onboarding_complete)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', 'User'),
    'Asia/Kolkata',
    true
FROM auth.users
WHERE id = '465933c9-30d7-4753-b899-f1212ad7b88f'
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add default habits
INSERT INTO public.habits (user_id, name, icon, weight, domain, sort_order) VALUES
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'Wake up on time', '⏰', 15, 'discipline', 1),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'Cold shower', '🚿', 10, 'discipline', 2),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'No phone first hour', '📵', 10, 'discipline', 3),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'Meditate', '🧘', 10, 'personal', 4),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'Plan tomorrow', '📝', 10, 'discipline', 5),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'Workout', '💪', 15, 'health', 6),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'Read 30 mins', '📚', 10, 'learning', 7)
ON CONFLICT DO NOTHING;

-- Step 3: Create streak record
INSERT INTO public.streaks (user_id, current_streak, longest_streak)
VALUES ('465933c9-30d7-4753-b899-f1212ad7b88f', 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Create default domains
INSERT INTO public.user_domains (user_id, domain) VALUES
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'discipline'),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'health'),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'finance'),
    ('465933c9-30d7-4753-b899-f1212ad7b88f', 'learning')
ON CONFLICT DO NOTHING;

-- Step 5: Create a test Cash account
INSERT INTO public.accounts (user_id, name, type, opening_balance, current_balance, is_default)
VALUES ('465933c9-30d7-4753-b899-f1212ad7b88f', 'Cash', 'cash', 5000, 5000, true)
ON CONFLICT DO NOTHING;

-- Verify results
SELECT 'profiles' AS table_name, COUNT(*) AS count FROM public.profiles WHERE id = '465933c9-30d7-4753-b899-f1212ad7b88f'
UNION ALL SELECT 'habits', COUNT(*) FROM public.habits WHERE user_id = '465933c9-30d7-4753-b899-f1212ad7b88f'
UNION ALL SELECT 'streaks', COUNT(*) FROM public.streaks WHERE user_id = '465933c9-30d7-4753-b899-f1212ad7b88f'
UNION ALL SELECT 'domains', COUNT(*) FROM public.user_domains WHERE user_id = '465933c9-30d7-4753-b899-f1212ad7b88f'
UNION ALL SELECT 'accounts', COUNT(*) FROM public.accounts WHERE user_id = '465933c9-30d7-4753-b899-f1212ad7b88f';
