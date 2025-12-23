'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { HabitWithLog, Workout, LearningLog, DailyReflection } from '@/types/database';

interface DailyLogData {
  habits: Array<{ habit_id: string; completed: boolean }>;
  workout?: {
    type: 'gym' | 'cardio' | 'yoga' | 'swim' | 'rest' | 'calisthenics';
    program?: string;
    duration_min?: number;
    effort?: number;
  };
  learning?: {
    leetcode_solved?: number;
    study_hours?: number;
    pages_read?: number;
  };
  reflection?: {
    impulse_rating?: number;
    energy_level?: number;
    mood?: number;
    note?: string;
  };
}

interface DailyLogSummary {
  date: string;
  habits: {
    list: HabitWithLog[];
    completed: number;
    total: number;
  };
  workout: Workout | null;
  learning: LearningLog | null;
  reflection: DailyReflection | null;
  score: number;
}

/**
 * Get complete daily log for a date
 */
export async function getDailyLog(date?: string): Promise<DailyLogSummary> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const targetDate = date || new Date().toISOString().split('T')[0];

  // Fetch all data in parallel
  const [habitsResult, workoutResult, learningResult, reflectionResult, scoreResult] = await Promise.all([
    supabase
      .from('habits')
      .select(`*, habit_logs!left(id, completed, date)`)
      .eq('user_id', user.id)
      .eq('active', true)
      .eq('habit_logs.date', targetDate)
      .order('sort_order', { ascending: true }),
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('workout_date', targetDate)
      .maybeSingle(),
    supabase
      .from('learning_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', targetDate)
      .maybeSingle(),
    supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', targetDate)
      .maybeSingle(),
    supabase
      .from('discipline_scores')
      .select('total_score')
      .eq('user_id', user.id)
      .eq('date', targetDate)
      .maybeSingle(),
  ]);

  const habits: HabitWithLog[] = (habitsResult.data || []).map(h => ({
    ...h,
    log: h.habit_logs?.[0] || undefined,
  }));

  const completed = habits.filter(h => h.log?.completed).length;

  return {
    date: targetDate,
    habits: {
      list: habits,
      completed,
      total: habits.length,
    },
    workout: workoutResult.data,
    learning: learningResult.data,
    reflection: reflectionResult.data,
    score: scoreResult.data?.total_score || 0,
  };
}

/**
 * Save complete daily log (unified save)
 */
export async function saveDailyLog(date: string, data: DailyLogData): Promise<{
  success: boolean;
  score: number;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Save habits
  if (data.habits.length > 0) {
    const habitLogs = data.habits.map(h => ({
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
  if (data.workout) {
    await supabase
      .from('workouts')
      .upsert({
        user_id: user.id,
        workout_date: date,
        workout_type: data.workout.type,
        program: data.workout.program || null,
        duration_mins: data.workout.duration_min || null,
        effort: data.workout.effort || null,
      }, { onConflict: 'user_id,workout_date' });
  }

  // Save learning
  if (data.learning) {
    await supabase
      .from('learning_logs')
      .upsert({
        user_id: user.id,
        date,
        leetcode_solved: data.learning.leetcode_solved || 0,
        study_hours: data.learning.study_hours || 0,
        pages_read: data.learning.pages_read || 0,
      }, { onConflict: 'user_id,date' });
  }

  // Save reflection
  if (data.reflection) {
    await supabase
      .from('daily_reflections')
      .upsert({
        user_id: user.id,
        date,
        impulse_rating: data.reflection.impulse_rating || null,
        energy_level: data.reflection.energy_level || null,
        mood: data.reflection.mood || null,
        note: data.reflection.note || null,
      }, { onConflict: 'user_id,date' });
  }

  // Calculate and save discipline score
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
      habits_data: {
        completed: data.habits.filter(h => h.completed).length,
        total: data.habits.length,
      },
    }, { onConflict: 'user_id,date' });
  }

  // Update streak if all habits done
  const allHabitsDone = data.habits.every(h => h.completed);
  if (allHabitsDone && data.habits.length > 0) {
    await updateStreak(supabase, user.id, date);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/log');

  return { success: true, score: totalScore };
}

/**
 * Save reflection only
 */
export async function saveReflection(
  date: string,
  data: {
    impulse_rating?: number;
    energy_level?: number;
    mood?: number;
    gratitude?: string;
    note?: string;
  }
): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase
    .from('daily_reflections')
    .upsert({
      user_id: user.id,
      date,
      impulse_rating: data.impulse_rating || null,
      energy_level: data.energy_level || null,
      mood: data.mood || null,
      gratitude: data.gratitude || null,
      note: data.note || null,
    }, { onConflict: 'user_id,date' });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/personal');
}

// Helper: Update streak
async function updateStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  date: string
): Promise<void> {
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!streak) {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_log_date: date,
      streak_started_at: date,
    });
    return;
  }

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (streak.last_log_date === yesterdayStr) {
    newStreak = streak.current_streak + 1;
  } else if (streak.last_log_date === date) {
    return;
  }

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak.longest_streak),
      last_log_date: date,
      streak_started_at: newStreak === 1 ? date : streak.streak_started_at,
    })
    .eq('user_id', userId);
}

