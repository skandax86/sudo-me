# Supabase Database Setup

## Quick Start (Development)

### Option 1: Supabase Dashboard
1. Go to your Supabase project → SQL Editor
2. Copy-paste the entire contents of `schema.sql`
3. Run it

### Option 2: CLI (if using local Supabase)
```bash
# Reset and apply schema
supabase db reset
# OR
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/schema.sql
```

## Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (extends auth.users) |
| `user_domains` | Which domains user tracks |
| `habits` | User's custom habits |
| `habit_logs` | Daily habit completions |
| `streaks` | Current/longest streak |
| `discipline_scores` | Cached daily scores |

### Health Domain
| Table | Purpose |
|-------|---------|
| `workouts` | Daily workout log |
| `exercise_logs` | Individual exercises |

### Finance Domain
| Table | Purpose |
|-------|---------|
| `accounts` | Bank/Cash/Wallet accounts |
| `transactions` | Income/Expense logs |
| `category_budgets` | Monthly category limits |

### Learning Domain
| Table | Purpose |
|-------|---------|
| `learning_logs` | LeetCode/Study/Reading |

### Personal Domain
| Table | Purpose |
|-------|---------|
| `daily_reflections` | Mood/Energy/Journal |
| `goals` | Long-term goals |
| `notifications` | System notifications |

## Auto-Generated on User Signup

When a user signs up:
1. Profile is created (via `handle_new_user` trigger)
2. 5 default habits are created
3. Streak record is initialized
4. Default domains (discipline, health, finance, learning) are activated

## Key Functions

### `calculate_discipline_score(user_id, date)`
Returns habits_score, fitness_score, learning_score, total_score.

Formula:
- Habits: 60% (weighted by habit.weight)
- Fitness: 20% (workout=15-20pts, rest=10pts)
- Learning: 20% (5pts/LC, 4pts/hr study, 0.2pts/page)

### `increment_xp(user_id, amount)`
Adds XP to user's profile.

### `update_account_balance()`
Auto-updates account balance on transaction changes.

## Development Tips

1. **Reset everything**: Just re-run `schema.sql`
2. **Keep test users**: Comment out the DROP statements at the top
3. **Add new table**: Add to schema.sql, re-run everything

## Moving to Production

When ready for production:
1. Create proper migrations from schema.sql
2. Use `supabase migration new` for future changes
3. Never run DROP statements in production!

