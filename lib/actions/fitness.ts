'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Workout, WorkoutType, GymProgram, WorkoutWithExercises } from '@/types/database';

interface ExerciseInput {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

/**
 * Log a workout
 */
export async function logWorkout(
  date: string,
  workoutType: WorkoutType,
  options?: {
    program?: GymProgram;
    durationMin?: number;
    effort?: number;
    exercises?: ExerciseInput[];
    notes?: string;
  }
): Promise<Workout> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Upsert workout
  const { data: workout, error } = await supabase
    .from('workouts')
    .upsert({
      user_id: user.id,
      workout_date: date,
      workout_type: workoutType,
      program: options?.program || null,
      duration_mins: options?.durationMin || null,
      effort: options?.effort || null,
      notes: options?.notes || null,
    }, {
      onConflict: 'user_id,workout_date',
    })
    .select()
    .single();

  if (error) throw error;

  // Add exercises if provided
  if (options?.exercises && options.exercises.length > 0) {
    // Delete existing exercises
    await supabase
      .from('exercise_logs')
      .delete()
      .eq('workout_id', workout.id);

    // Insert new exercises
    const exerciseLogs = options.exercises.map((ex, index) => ({
      workout_id: workout.id,
      exercise: ex.exercise,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      unit: 'kg',
      sort_order: index,
    }));

    await supabase.from('exercise_logs').insert(exerciseLogs);
  }

  // Update discipline score
  await updateDisciplineScore(supabase, user.id, date);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/health');

  return workout;
}

/**
 * Log a rest day
 */
export async function logRestDay(date: string, note?: string): Promise<Workout> {
  return logWorkout(date, 'rest', { notes: note });
}

/**
 * Get today's workout
 */
export async function getTodayWorkout(): Promise<WorkoutWithExercises | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const today = new Date().toISOString().split('T')[0];

  const { data: workout } = await supabase
    .from('workouts')
    .select(`
      *,
      exercise_logs(*)
    `)
    .eq('user_id', user.id)
    .eq('workout_date', today)
    .maybeSingle();

  return workout;
}

/**
 * Get recent workouts
 */
export async function getRecentWorkouts(limit: number = 7): Promise<WorkoutWithExercises[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      *,
      exercise_logs(*)
    `)
    .eq('user_id', user.id)
    .order('workout_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return workouts || [];
}

/**
 * Get workout stats for the week
 */
export async function getWeeklyWorkoutStats(): Promise<{
  workoutsThisWeek: number;
  restDays: number;
  totalDuration: number;
  averageEffort: number;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: workouts } = await supabase
    .from('workouts')
    .select('workout_type, duration_mins, effort')
    .eq('user_id', user.id)
    .gte('workout_date', weekStartStr);

  const stats = {
    workoutsThisWeek: 0,
    restDays: 0,
    totalDuration: 0,
    averageEffort: 0,
  };

  if (!workouts || workouts.length === 0) return stats;

  let totalEffort = 0;
  let effortCount = 0;

  workouts.forEach(w => {
    if (w.workout_type === 'rest') {
      stats.restDays++;
    } else {
      stats.workoutsThisWeek++;
    }
    stats.totalDuration += w.duration_mins || 0;
    if (w.effort) {
      totalEffort += w.effort;
      effortCount++;
    }
  });

  stats.averageEffort = effortCount > 0 ? Math.round(totalEffort / effortCount) : 0;

  return stats;
}

/**
 * Delete a workout
 */
export async function deleteWorkout(workoutId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/health');
}

// Helper: Update discipline score
async function updateDisciplineScore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  date: string
): Promise<void> {
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
  }
}

