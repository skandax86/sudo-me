'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Habit, HabitWithLog } from '@/types/database';

/**
 * Get all active habits with today's completion status
 */
export async function getHabitsWithLogs(date?: string): Promise<{
  habits: HabitWithLog[];
  completed: number;
  total: number;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data: habits, error } = await supabase
    .from('habits')
    .select(`
      *,
      habit_logs!left(id, completed, date)
    `)
    .eq('user_id', user.id)
    .eq('active', true)
    .eq('habit_logs.date', targetDate)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const formattedHabits: HabitWithLog[] = habits?.map(habit => ({
    ...habit,
    log: habit.habit_logs?.[0] || undefined,
  })) || [];

  const completed = formattedHabits.filter(h => h.log?.completed).length;
  const total = formattedHabits.length;

  return { habits: formattedHabits, completed, total };
}

/**
 * Toggle a single habit's completion status
 */
export async function toggleHabit(habitId: string, date: string, completed: boolean): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify habit belongs to user
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', user.id)
    .single();

  if (!habit) throw new Error('Habit not found');

  // Upsert habit log
  const { error } = await supabase
    .from('habit_logs')
    .upsert({
      habit_id: habitId,
      user_id: user.id,
      date,
      completed,
    }, {
      onConflict: 'habit_id,date',
    });

  if (error) throw error;

  // Recalculate discipline score
  await recalculateScore(supabase, user.id, date);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/discipline');
}

/**
 * Save all habits for a day (bulk update)
 */
export async function saveHabitsForDay(
  date: string,
  habitStates: Array<{ habit_id: string; completed: boolean }>
): Promise<{ success: boolean; score: number }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Upsert all habit logs
  const logs = habitStates.map(h => ({
    habit_id: h.habit_id,
    user_id: user.id,
    date,
    completed: h.completed,
  }));

  const { error } = await supabase
    .from('habit_logs')
    .upsert(logs, { onConflict: 'habit_id,date' });

  if (error) throw error;

  // Recalculate score
  const score = await recalculateScore(supabase, user.id, date);

  // Update streak if all done
  const allDone = habitStates.every(h => h.completed);
  if (allDone) {
    await updateStreak(supabase, user.id, date);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/discipline');

  return { success: true, score };
}

/**
 * Create a new habit
 */
export async function createHabit(
  name: string,
  icon: string = '✅',
  weight: number = 10,
  domain: string = 'discipline'
): Promise<Habit> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get max sort order
  const { data: maxOrder } = await supabase
    .from('habits')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const { data: habit, error } = await supabase
    .from('habits')
    .insert({
      user_id: user.id,
      name,
      icon,
      weight,
      domain,
      sort_order: (maxOrder?.sort_order || 0) + 1,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/discipline');
  revalidatePath('/dashboard/settings');

  return habit;
}

/**
 * Update a habit
 */
export async function updateHabit(
  habitId: string,
  updates: Partial<Pick<Habit, 'name' | 'icon' | 'weight' | 'active' | 'sort_order'>>
): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/discipline');
  revalidatePath('/dashboard/settings');
}

/**
 * Delete (deactivate) a habit
 */
export async function deleteHabit(habitId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('habits')
    .update({ active: false })
    .eq('id', habitId)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/discipline');
  revalidatePath('/dashboard/settings');
}

// Helper: Recalculate discipline score
async function recalculateScore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  date: string
): Promise<number> {
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

    return score[0].total_score;
  }

  return 0;
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
    return; // Already logged today
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

  // Add XP
  await supabase
    .from('profiles')
    .update({ total_xp: (streak.current_streak || 0) + 20 })
    .eq('id', userId);
}

