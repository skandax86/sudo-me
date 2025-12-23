import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Toggle habit completion
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habit_id, date, completed } = await request.json();

    if (!habit_id || !date) {
      return NextResponse.json({ error: 'habit_id and date are required' }, { status: 400 });
    }

    // Verify habit belongs to user
    const { data: habit } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habit_id)
      .eq('user_id', user.id)
      .single();

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Upsert habit log
    const { data: log, error } = await supabase
      .from('habit_logs')
      .upsert({
        habit_id,
        user_id: user.id,
        date,
        completed: completed ?? true,
      }, {
        onConflict: 'habit_id,date',
      })
      .select()
      .single();

    if (error) {
      console.error('Habit log error:', error);
      return NextResponse.json({ error: 'Failed to log habit' }, { status: 500 });
    }

    // Update discipline score and get new score
    const score = await updateDisciplineScore(supabase, user.id, date);

    // Check if all habits done → update streak
    await updateStreak(supabase, user.id, date);

    return NextResponse.json({
      success: true,
      log,
      score,
      message: completed ? 'Habit completed!' : 'Habit unmarked',
    });
  } catch (error) {
    console.error('Habit log error:', error);
    return NextResponse.json({ error: 'Failed to log habit' }, { status: 500 });
  }
}

// Bulk toggle multiple habits
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, habits } = await request.json();

    if (!date || !habits || !Array.isArray(habits)) {
      return NextResponse.json({ error: 'date and habits array required' }, { status: 400 });
    }

    // Upsert all habit logs
    const logs = habits.map(h => ({
      habit_id: h.habit_id,
      user_id: user.id,
      date,
      completed: h.completed,
    }));

    const { error } = await supabase
      .from('habit_logs')
      .upsert(logs, { onConflict: 'habit_id,date' });

    if (error) {
      console.error('Bulk habit log error:', error);
      return NextResponse.json({ error: 'Failed to log habits' }, { status: 500 });
    }

    // Update discipline score and get new score
    const score = await updateDisciplineScore(supabase, user.id, date);

    // Update streak
    await updateStreak(supabase, user.id, date);

    return NextResponse.json({
      success: true,
      score,
      message: 'Habits updated',
    });
  } catch (error) {
    console.error('Bulk habit log error:', error);
    return NextResponse.json({ error: 'Failed to log habits' }, { status: 500 });
  }
}

// Helper: Update discipline score and return it
async function updateDisciplineScore(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string, date: string) {
  const { data: score } = await supabase.rpc('calculate_discipline_score', {
    p_user_id: userId,
    p_date: date,
  });

  if (score && score.length > 0) {
    await supabase.from('discipline_scores').upsert({
      user_id: userId,
      date,
      habits_score: score[0].habits_score,
      fitness_score: score[0].fitness_score,
      learning_score: score[0].learning_score,
      total_score: score[0].total_score,
    }, { onConflict: 'user_id,date' });

    return {
      habits: score[0].habits_score,
      fitness: score[0].fitness_score,
      learning: score[0].learning_score,
      total: score[0].total_score,
    };
  }

  return null;
}

// Helper: Update streak
async function updateStreak(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string, date: string) {
  // Get all active habits
  const { data: habits } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('active', true);

  if (!habits || habits.length === 0) return;

  // Get today's logs
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('habit_id, completed')
    .eq('user_id', userId)
    .eq('date', date);

  const completedCount = logs?.filter(l => l.completed).length || 0;
  const allDone = completedCount >= habits.length;

  if (!allDone) return;

  // Get current streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!streak) {
    // Create new streak
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_log_date: date,
      streak_started_at: date,
    });
    return;
  }

  // Check if yesterday was logged
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  let newLongest = streak.longest_streak;

  if (streak.last_log_date === yesterdayStr) {
    // Continue streak
    newStreak = streak.current_streak + 1;
  } else if (streak.last_log_date === date) {
    // Already logged today
    return;
  }

  if (newStreak > newLongest) {
    newLongest = newStreak;
  }

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_log_date: date,
      streak_started_at: newStreak === 1 ? date : streak.streak_started_at,
    })
    .eq('user_id', userId);

  // Update XP in profile
  const xpGain = allDone ? 20 : 10;
  await supabase.rpc('increment_xp', { p_user_id: userId, p_xp_amount: xpGain });
}

