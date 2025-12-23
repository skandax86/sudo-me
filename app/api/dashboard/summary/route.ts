import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DashboardSummary } from '@/types/database';
import { detectDailyWins, getLevelFromXP, getXPProgress } from '@/lib/gamification';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const monthStart = `${today.slice(0, 7)}-01`;

    // Fetch all data in parallel
    const [
      profileResult,
      streakResult,
      habitsResult,
      habitLogsResult,
      workoutResult,
      learningResult,
      transactionsResult,
      scoreResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('active', true),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('workouts').select('*').eq('user_id', user.id).eq('workout_date', today).maybeSingle(),
      supabase.from('learning_logs').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('transactions')
        .select('amount, type, category')
        .eq('user_id', user.id)
        .gte('transaction_date', monthStart)
        .eq('type', 'expense'),
      supabase.from('discipline_scores').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    ]);

    const profile = profileResult.data;
    const streak = streakResult.data;
    const habits = habitsResult.data || [];
    const habitLogs = habitLogsResult.data || [];
    const workout = workoutResult.data;
    const learning = learningResult.data;
    const transactions = transactionsResult.data || [];
    const score = scoreResult.data;

    // Calculate day number
    const startDate = profile?.start_date ? new Date(profile.start_date) : new Date();
    const dayNumber = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate habits done
    const habitsDone = habitLogs.filter(log => log.completed).length;
    const totalHabits = habits.length;

    // Calculate spending
    const spentThisMonth = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const spentToday = transactions
      .filter(t => t.transaction_date === today)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Detect wins
    const wins = detectDailyWins({
      currentStreak: streak?.current_streak || 0,
      previousStreak: (streak?.current_streak || 1) - 1,
      todayHabitsComplete: habitsDone,
      totalHabits,
      workedOut: !!workout && workout.workout_type !== 'rest',
      stayedUnderBudget: spentThisMonth < (profile?.preferences?.monthlyBudget || 50000),
      leetCodeToday: learning?.leetcode_solved || 0,
      pagesReadToday: learning?.pages_read || 0,
      studyHoursToday: learning?.study_hours || 0,
      savedMoney: 0,
    });

    // XP progress
    const level = getLevelFromXP(profile?.total_xp || 0);
    const xpProgress = getXPProgress(profile?.total_xp || 0);

    const summary: DashboardSummary = {
      day: dayNumber,
      discipline_score: score?.total_score || 0,
      streak: streak?.current_streak || 0,
      domains: {
        discipline: {
          habits_done: habitsDone,
          total: totalHabits,
        },
        health: {
          today_done: workout ? 1 : 0,
          total: 1,
        },
        finance: {
          spent_today: spentToday,
          budget_status: spentThisMonth > (profile?.preferences?.monthlyBudget || 50000) * 0.9 ? 'red' :
                         spentThisMonth > (profile?.preferences?.monthlyBudget || 50000) * 0.7 ? 'yellow' : 'green',
        },
        learning: {
          study_hours: learning?.study_hours || 0,
          leetcode: learning?.leetcode_solved || 0,
        },
      },
      wins,
      xp: {
        current: profile?.total_xp || 0,
        level: level.name,
        progress: xpProgress.percentage,
      },
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}

