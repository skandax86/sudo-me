-- Remove duplicate habits (keep only one of each name)
DELETE FROM public.habits
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM public.habits 
    GROUP BY user_id, name
);

-- Verify
SELECT name, icon, weight, domain FROM public.habits 
WHERE user_id = '465933c9-30d7-4753-b899-f1212ad7b88f'
ORDER BY sort_order;

