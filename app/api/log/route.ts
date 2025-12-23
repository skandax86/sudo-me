import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/log?date=YYYY-MM-DD
 * Get complete daily log for a date
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch all data in parallel
    const [habitsResult, workoutResult, learningResult, reflectionResult, scoreResult] = await Promise.all([
      supabase
        .from('habits')
        .select(`*, habit_logs!left(id, completed, date)`)
        .eq('user_id', user.id)
        .eq('active', true)
        .eq('habit_logs.date', date)
        .order('sort_order', { ascending: true }),
      supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('workout_date', date)
        .maybeSingle(),
      supabase
        .from('learning_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle(),
      supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle(),
      supabase
        .from('discipline_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle(),
    ]);

    const habits = (habitsResult.data || []).map(h => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      weight: h.weight,
      completed: h.habit_logs?.[0]?.completed || false,
    }));

    return NextResponse.json({
      date,
      habits: {
        list: habits,
        completed: habits.filter(h => h.completed).length,
        total: habits.length,
      },
      workout: workoutResult.data,
      learning: learningResult.data || { leetcode_solved: 0, pages_read: 0, study_hours: 0 },
      reflection: reflectionResult.data,
      score: scoreResult.data?.total_score || 0,
      scoreBreakdown: scoreResult.data ? {
        habits: scoreResult.data.habits_score,
        fitness: scoreResult.data.fitness_score,
        learning: scoreResult.data.learning_score,
      } : null,
    });
  } catch (error) {
    console.error('Daily log GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch log' }, { status: 500 });
  }
}

/**
 * POST /api/log
 * Save complete daily log
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, habits, workout, learning, reflection } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Save habits
    if (habits && Array.isArray(habits)) {
      const habitLogs = habits.map((h: { habit_id: string; completed: boolean }) => ({
        habit_id: h.habit_id,
        user_id: user.id,
        date,
        completed: h.completed,
      }));

      await supabase
        .from('habit_logs')
        .upsert(habitLogs, { onConflict: 'habit_id,date' });
    }

    // Save workout
    if (workout && workout.type) {
      await supabase
        .from('workouts')
        .upsert({
          user_id: user.id,
          workout_date: date,
          workout_type: workout.type,
          program: workout.program || null,
          duration_mins: workout.duration_min || null,
          effort: workout.effort || null,
        }, { onConflict: 'user_id,workout_date' });
    }

    // Save learning
    if (learning) {
      await supabase
        .from('learning_logs')
        .upsert({
          user_id: user.id,
          date,
          leetcode_solved: learning.leetcode_solved || 0,
          study_hours: learning.study_hours || 0,
          pages_read: learning.pages_read || 0,
        }, { onConflict: 'user_id,date' });
    }

    // Save reflection
    if (reflection) {
      await supabase
        .from('daily_reflections')
        .upsert({
          user_id: user.id,
          date,
          impulse_rating: reflection.impulse_rating || null,
          energy_level: reflection.energy_level || null,
          mood: reflection.mood || null,
          note: reflection.note || null,
        }, { onConflict: 'user_id,date' });
    }

    // Calculate discipline score
    const { data: score } = await supabase.rpc('calculate_discipline_score', {
      p_user_id: user.id,
      p_date: date,
    });

    const totalScore = score?.[0]?.total_score || 0;

    if (score && score.length > 0) {
      await supabase.from('discipline_scores').upsert({
        user_id: user.id,
        date,
        habits_score: score[0].habits_score,
        fitness_score: score[0].fitness_score,
        learning_score: score[0].learning_score,
        total_score: score[0].total_score,
      }, { onConflict: 'user_id,date' });
    }

    // Check if all habits complete → update streak
    if (habits) {
      const allComplete = habits.every((h: { completed: boolean }) => h.completed);
      if (allComplete && habits.length > 0) {
        await updateStreak(supabase, user.id, date);
      }
    }

    return NextResponse.json({
      success: true,
      score: totalScore,
      message: 'Day logged successfully!',
    });
  } catch (error) {
    console.error('Daily log POST error:', error);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}

// Helper: Update streak
async function updateStreak(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, date: string) {
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!streak) {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_log_date: date,
      streak_started_at: date,
    });
    
    // Add XP
    await supabase.rpc('increment_xp', { p_user_id: userId, p_xp_amount: 20 });
    return;
  }

  if (streak.last_log_date === date) {
    return; // Already logged today
  }

  let newStreak = 1;
  if (streak.last_log_date === yesterdayStr) {
    newStreak = streak.current_streak + 1;
  }

  const newLongest = Math.max(newStreak, streak.longest_streak);

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_log_date: date,
      streak_started_at: newStreak === 1 ? date : streak.streak_started_at,
    })
    .eq('user_id', userId);

  // Add XP based on streak
  let xp = 20; // Base XP
  if (newStreak === 7) xp = 50;
  else if (newStreak === 14) xp = 100;
  else if (newStreak === 21) xp = 150;
  else if (newStreak === 30) xp = 250;
  else if (newStreak === 60) xp = 500;
  else if (newStreak === 90) xp = 1000;

  await supabase.rpc('increment_xp', { p_user_id: userId, p_xp_amount: xp });
}

