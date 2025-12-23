-- ============================================
-- BHAGM's 2025-2026 Finance Setup
-- Run this after schema.sql
-- ============================================

DO $$
DECLARE
    v_user_id UUID;
    v_bank_id UUID;
    v_cash_id UUID;
    v_plan_id UUID;
BEGIN
    -- Get first user (your account)
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found. Please sign up first.';
    END IF;

    -- ==========================================
    -- ACCOUNTS
    -- ==========================================
    DELETE FROM public.accounts WHERE user_id = v_user_id;
    
    INSERT INTO public.accounts (user_id, name, type, currency, opening_balance, current_balance, is_default) VALUES
    (v_user_id, 'SBI Salary Account', 'bank', 'INR', 0, 0, true),
    (v_user_id, 'HDFC Savings', 'bank', 'INR', 0, 0, false),
    (v_user_id, 'Groww (Investments)', 'wallet', 'INR', 0, 0, false),
    (v_user_id, 'Zerodha', 'wallet', 'INR', 0, 0, false),
    (v_user_id, 'Cash', 'cash', 'INR', 0, 0, false)
    RETURNING id INTO v_bank_id;
    
    SELECT id INTO v_cash_id FROM public.accounts WHERE user_id = v_user_id AND type = 'cash';

    -- ==========================================
    -- BUDGET PLAN (January 2025)
    -- ==========================================
    DELETE FROM public.budget_plans WHERE user_id = v_user_id;
    
    INSERT INTO public.budget_plans (user_id, year, month, essential_needs, desires_wants, investments, savings_emergency, short_mid_goals, total_income)
    VALUES (v_user_id, 2025, 1, 30000, 10000, 20000, 20000, 15000, 80000)
    RETURNING id INTO v_plan_id;

    -- ==========================================
    -- BUDGET SUBCATEGORIES - Essential Needs (₹30,000)
    -- ==========================================
    DELETE FROM public.budget_subcategories WHERE user_id = v_user_id;
    
    INSERT INTO public.budget_subcategories (user_id, budget_plan_id, parent_category, name, planned_amount, sort_order) VALUES
    -- Essential Needs
    (v_user_id, v_plan_id, 'essential_needs', 'Rent', 6000, 1),
    (v_user_id, v_plan_id, 'essential_needs', 'Commute (Uber/Metro/IRCTC)', 4500, 2),
    (v_user_id, v_plan_id, 'essential_needs', 'Food (Office + Restaurant)', 4500, 3),
    (v_user_id, v_plan_id, 'essential_needs', 'Groceries + Utilities', 4000, 4),
    (v_user_id, v_plan_id, 'essential_needs', 'Insurance (Term + Health)', 3500, 5),
    (v_user_id, v_plan_id, 'essential_needs', 'Internet + Mobile', 1000, 6),
    (v_user_id, v_plan_id, 'essential_needs', 'Subscriptions (Spotify/Amazon)', 500, 7),
    (v_user_id, v_plan_id, 'essential_needs', 'Margin Buffer', 2000, 8),
    
    -- Desires & Wants
    (v_user_id, v_plan_id, 'desires_wants', 'Shopping / Lifestyle', 4500, 1),
    (v_user_id, v_plan_id, 'desires_wants', 'Supplements (Protein/Creatine)', 2000, 2),
    (v_user_id, v_plan_id, 'desires_wants', 'Skincare', 1000, 3),
    (v_user_id, v_plan_id, 'desires_wants', 'On-demand Margin', 2500, 4),
    
    -- Savings & Emergency
    (v_user_id, v_plan_id, 'savings_emergency', 'Amma Transfer', 15000, 1),
    (v_user_id, v_plan_id, 'savings_emergency', 'Emergency Fund (Liquid MF)', 5000, 2),
    
    -- Short & Mid-term Goals
    (v_user_id, v_plan_id, 'short_mid_goals', 'Travel Fund', 2000, 1),
    (v_user_id, v_plan_id, 'short_mid_goals', 'Major Trip Savings', 3000, 2),
    (v_user_id, v_plan_id, 'short_mid_goals', 'EU/AU Migration Fund', 3000, 3),
    (v_user_id, v_plan_id, 'short_mid_goals', 'Luxury Bike Fund', 0, 4), -- Start after EF
    (v_user_id, v_plan_id, 'short_mid_goals', 'Buffer', 2000, 5);

    -- ==========================================
    -- INVESTMENTS (Your Portfolio)
    -- ==========================================
    DELETE FROM public.investments WHERE user_id = v_user_id;
    
    INSERT INTO public.investments (user_id, name, symbol, category, risk_level, platform, is_sip, sip_amount, sip_date, notes) VALUES
    -- Core Portfolio (Low-Mid Risk)
    (v_user_id, 'SBI-ETF Nifty 50', 'SETFNIF50', 'etf', 'medium', 'Groww', true, 3000, 5, 'Stable large-cap foundation'),
    (v_user_id, 'Nifty Next 50 ETF', 'NIFTYBEES', 'etf', 'medium', 'Groww', true, 4000, 5, 'High-growth index'),
    (v_user_id, 'Gold ETF (Groww)', 'GOLDBEES', 'gold', 'low', 'Groww', true, 2000, 5, 'Hedge + stability'),
    (v_user_id, 'Silver ETF (Nippon)', 'SILVERBEES', 'silver', 'medium', 'Groww', true, 1000, 5, 'Growth + hedge'),
    (v_user_id, 'UTI Gold ETF', 'UTIGOLD', 'gold', 'low', 'Groww', true, 1000, 5, 'Additional gold allocation'),
    (v_user_id, 'Nippon SilverBEES', 'SILVERBEES', 'silver', 'medium', 'Groww', true, 2000, 5, 'Silver allocation'),
    (v_user_id, 'TATA Silver', 'TATASILV', 'silver', 'medium', 'Groww', true, 2000, 5, 'Silver diversification'),
    
    -- Satellite Portfolio (Mid-High Risk)
    (v_user_id, 'Groww Nifty India Defence ETF', 'DEFENCEBEES', 'etf', 'high', 'Groww', true, 2000, 5, 'High-conviction themed'),
    (v_user_id, 'SBI PSU Fund', 'SBIPSU', 'mutual_fund', 'medium', 'Groww', true, 1000, 5, 'Value + dividends'),
    (v_user_id, 'Kalyan Jewellers', 'KALYANJL', 'stock', 'high', 'Groww', false, NULL, NULL, 'Individual stock'),
    
    -- Safety Mix
    (v_user_id, 'Liquid Mutual Fund', 'LIQUIDFUND', 'mutual_fund', 'low', 'Groww', true, 3000, 5, 'Emergency + stable returns'),
    (v_user_id, 'Recurring Deposit', 'RD', 'rd', 'low', 'SBI', true, 1000, 5, 'Guaranteed safe return'),
    
    -- High Risk
    (v_user_id, 'Bitcoin (BTC)', 'BTC', 'crypto', 'high', 'WazirX', false, 1000, NULL, 'Small allocation upside'),
    
    -- Insurance/Long-term
    (v_user_id, 'NPS Contribution', 'NPS', 'nps', 'low', 'SBI', true, 2500, 5, 'Retirement + tax benefit'),
    (v_user_id, 'Term Insurance', 'TERM', 'other', 'low', 'ICICI', true, 600, 1, '1 Crore cover');

    -- ==========================================
    -- RECURRING TRANSACTIONS
    -- ==========================================
    DELETE FROM public.recurring_transactions WHERE user_id = v_user_id;
    
    INSERT INTO public.recurring_transactions (user_id, name, type, category, subcategory, amount, frequency, day_of_period, start_date, is_active, notes) VALUES
    -- Income
    (v_user_id, 'Salary', 'income', 'Salary', 'Monthly', 80000, 'monthly', 1, '2025-01-01', true, 'Monthly salary credit'),
    
    -- Essential Expenses
    (v_user_id, 'Rent', 'expense', 'Essential', 'Rent', 6000, 'monthly', 1, '2025-01-01', true, 'Monthly rent'),
    (v_user_id, 'Term Insurance Premium', 'expense', 'Essential', 'Insurance', 600, 'monthly', 5, '2025-01-01', true, 'ICICI Term Insurance'),
    (v_user_id, 'Health Insurance Premium', 'expense', 'Essential', 'Insurance', 2900, 'monthly', 5, '2025-01-01', true, 'Health coverage'),
    (v_user_id, 'Spotify', 'expense', 'Subscription', 'Entertainment', 59, 'monthly', 15, '2025-01-01', true, 'Music streaming'),
    (v_user_id, 'Google Photos', 'expense', 'Subscription', 'Storage', 210, 'monthly', 10, '2025-01-01', true, 'Photo backup'),
    (v_user_id, 'Gym Membership', 'expense', 'Lifestyle', 'Fitness', 1500, 'monthly', 1, '2025-01-01', true, 'Monthly gym'),
    
    -- Family
    (v_user_id, 'Amma Transfer', 'expense', 'Family', 'Support', 15000, 'monthly', 5, '2025-01-01', true, 'Monthly family support');

    -- ==========================================
    -- FINANCIAL GOALS (Long-term targets)
    -- ==========================================
    -- These are already in seed-bhagm-goals.sql, but adding finance-specific ones
    INSERT INTO public.goals (user_id, title, description, domain, timeframe, target_value, current_value, unit, due_date, status) VALUES
    -- Emergency Fund
    (v_user_id, 'Build Emergency Fund (1L)', '3-6 months expenses in liquid fund', 'finance', 'short', 100000, 0, 'INR', '2025-06-30', 'active'),
    
    -- Mid-term
    (v_user_id, 'EU/AU Migration Fund', 'Savings for potential international move', 'finance', 'mid', 200000, 0, 'INR', '2027-12-31', 'active'),
    (v_user_id, 'Luxury Bike Fund', 'Down payment for Royal Enfield or similar', 'finance', 'mid', 150000, 0, 'INR', '2028-12-31', 'active'),
    
    -- Long-term
    (v_user_id, 'Build 50L Corpus', 'Long-term wealth building through SIPs', 'finance', 'long', 5000000, 0, 'INR', '2032-12-31', 'active'),
    (v_user_id, 'Emergency Fund (5L)', 'Full emergency buffer', 'finance', 'long', 500000, 0, 'INR', '2035-12-31', 'active')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Successfully seeded finance data for user: %', v_user_id;
END $$;

-- Verify the data
SELECT 'Accounts' as type, COUNT(*) as count FROM public.accounts
UNION ALL
SELECT 'Investments' as type, COUNT(*) as count FROM public.investments
UNION ALL
SELECT 'Recurring' as type, COUNT(*) as count FROM public.recurring_transactions
UNION ALL
SELECT 'Budget Plans' as type, COUNT(*) as count FROM public.budget_plans
UNION ALL
SELECT 'Budget Subcategories' as type, COUNT(*) as count FROM public.budget_subcategories;

