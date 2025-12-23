import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active challenge
    const { data: session } = await supabase
      .from('challenge_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!session) {
      return NextResponse.json({
        active: false,
        message: 'No active challenge',
      });
    }

    // Calculate current day
    const startDate = new Date(session.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(dayDiff, 75);

    // Get today's log
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: todayLog } = await supabase
      .from('challenge_daily_logs')
      .select('*')
      .eq('session_id', session.id)
      .eq('date', todayStr)
      .single();

    // Count completed days
    const { count: completedDays } = await supabase
      .from('challenge_daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)
      .eq('passed', true);

    // Determine remaining tasks for today
    const remainingTasks = getRemainingTasks(session.challenge_type, todayLog);

    return NextResponse.json({
      active: true,
      session_id: session.id,
      challenge_type: session.challenge_type,
      start_date: session.start_date,
      current_day: currentDay,
      total_days: 75,
      completed_days: completedDays || 0,
      restart_count: session.restart_count,
      status: session.status,
      today_log: todayLog || null,
      remaining_tasks: remainingTasks,
      on_track: remainingTasks.length === 0,
      progress_percent: Math.round((currentDay / 75) * 100),
    });
  } catch (error) {
    console.error('Challenge status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

function getRemainingTasks(challengeType: string, log: any) {
  if (!log) {
    // All tasks remaining
    if (challengeType === '75_hard') {
      return ['workout_1', 'workout_2_outdoor', 'diet', 'water', 'reading', 'photo', 'no_alcohol'];
    }
    return ['workout_1', 'diet', 'water', 'reading', 'reflection'];
  }

  const remaining: string[] = [];
  
  if (!log.workout_1_done) remaining.push('workout_1');
  if (challengeType === '75_hard' && !log.workout_2_outdoor_done) remaining.push('workout_2_outdoor');
  if (!log.diet_followed) remaining.push('diet');
  if (!log.water_goal_done) remaining.push('water');
  if (!log.reading_done) remaining.push('reading');
  if (challengeType === '75_hard') {
    if (!log.progress_photo) remaining.push('photo');
    if (!log.no_alcohol) remaining.push('no_alcohol');
  } else {
    if (!log.reflection_done) remaining.push('reflection');
  }
  
  return remaining;
}

