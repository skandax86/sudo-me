'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { LearningLog } from '@/types/database';

/**
 * Log learning for a day
 */
export async function logLearning(
  date: string,
  data: {
    leetcode_solved?: number;
    study_hours?: number;
    pages_read?: number;
    topic?: string;
    note?: string;
  }
): Promise<LearningLog> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: log, error } = await supabase
    .from('learning_logs')
    .upsert({
      user_id: user.id,
      date,
      leetcode_solved: data.leetcode_solved || 0,
      study_hours: data.study_hours || 0,
      pages_read: data.pages_read || 0,
      topic: data.topic || null,
      note: data.note || null,
    }, {
      onConflict: 'user_id,date',
    })
    .select()
    .single();

  if (error) throw error;

  // Update discipline score
  await updateDisciplineScore(supabase, user.id, date);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/learning');

  return log;
}

/**
 * Get today's learning log
 */
export async function getTodayLearning(): Promise<LearningLog | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const today = new Date().toISOString().split('T')[0];

  const { data: log } = await supabase
    .from('learning_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  return log;
}

/**
 * Get learning stats for a period
 */
export async function getLearningStats(days: number = 7): Promise<{
  logs: LearningLog[];
  totals: {
    leetcode_solved: number;
    pages_read: number;
    study_hours: number;
  };
  averages: {
    leetcode_per_day: number;
    pages_per_day: number;
    hours_per_day: number;
  };
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data: logs } = await supabase
    .from('learning_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDateStr)
    .order('date', { ascending: false });

  const allLogs = logs || [];
  
  const totals = allLogs.reduce(
    (acc, log) => ({
      leetcode_solved: acc.leetcode_solved + (log.leetcode_solved || 0),
      pages_read: acc.pages_read + (log.pages_read || 0),
      study_hours: acc.study_hours + (log.study_hours || 0),
    }),
    { leetcode_solved: 0, pages_read: 0, study_hours: 0 }
  );

  const daysWithData = allLogs.length || 1;

  return {
    logs: allLogs,
    totals,
    averages: {
      leetcode_per_day: Math.round((totals.leetcode_solved / daysWithData) * 10) / 10,
      pages_per_day: Math.round((totals.pages_read / daysWithData) * 10) / 10,
      hours_per_day: Math.round((totals.study_hours / daysWithData) * 10) / 10,
    },
  };
}

/**
 * Quick increment LeetCode count
 */
export async function incrementLeetCode(count: number = 1): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const today = new Date().toISOString().split('T')[0];

  // Get current value
  const { data: existing } = await supabase
    .from('learning_logs')
    .select('leetcode_solved')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  const currentCount = existing?.leetcode_solved || 0;

  await supabase
    .from('learning_logs')
    .upsert({
      user_id: user.id,
      date: today,
      leetcode_solved: currentCount + count,
    }, {
      onConflict: 'user_id,date',
    });

  // Update discipline score
  await updateDisciplineScore(supabase, user.id, today);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/learning');
}

/**
 * Quick add study hours
 */
export async function addStudyHours(hours: number): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('learning_logs')
    .select('study_hours')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  const currentHours = existing?.study_hours || 0;

  await supabase
    .from('learning_logs')
    .upsert({
      user_id: user.id,
      date: today,
      study_hours: currentHours + hours,
    }, {
      onConflict: 'user_id,date',
    });

  await updateDisciplineScore(supabase, user.id, today);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/learning');
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

