import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Toggle a challenge task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_id, completed, date } = await request.json();

    if (!task_id) {
      return NextResponse.json({ error: 'task_id required' }, { status: 400 });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get active challenge
    const { data: session } = await supabase
      .from('challenge_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!session) {
      return NextResponse.json({ error: 'No active challenge' }, { status: 404 });
    }

    // Calculate day number
    const startDate = new Date(session.start_date);
    const logDate = new Date(targetDate);
    const dayNumber = Math.floor((logDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (dayNumber < 1 || dayNumber > 75) {
      return NextResponse.json({ error: 'Invalid day for this challenge' }, { status: 400 });
    }

    // Map task_id to column name
    const taskColumns: Record<string, string> = {
      workout_1: 'workout_1_done',
      workout_2_outdoor: 'workout_2_outdoor_done',
      diet: 'diet_followed',
      water: 'water_goal_done',
      reading: 'reading_done',
      photo: 'progress_photo',
      no_alcohol: 'no_alcohol',
      reflection: 'reflection_done',
    };

    const columnName = taskColumns[task_id];
    if (!columnName) {
      return NextResponse.json({ error: 'Invalid task_id' }, { status: 400 });
    }

    // Get or create daily log
    const { data: existingLog } = await supabase
      .from('challenge_daily_logs')
      .select('*')
      .eq('session_id', session.id)
      .eq('date', targetDate)
      .single();

    let log;
    if (existingLog) {
      // Update existing log
      const { data: updatedLog, error } = await supabase
        .from('challenge_daily_logs')
        .update({ [columnName]: completed ?? true })
        .eq('id', existingLog.id)
        .select()
        .single();

      if (error) throw error;
      log = updatedLog;
    } else {
      // Create new log
      const { data: newLog, error } = await supabase
        .from('challenge_daily_logs')
        .insert({
          session_id: session.id,
          user_id: user.id,
          date: targetDate,
          day_number: dayNumber,
          [columnName]: completed ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      log = newLog;
    }

    // Check if all tasks complete
    const allComplete = checkAllComplete(session.challenge_type, log);

    // Update log with completion status
    await supabase
      .from('challenge_daily_logs')
      .update({ 
        all_tasks_complete: allComplete,
        passed: allComplete,
      })
      .eq('id', log.id);

    // Update challenge session current day
    await supabase
      .from('challenge_sessions')
      .update({ current_day: dayNumber })
      .eq('id', session.id);

    // If all complete for today, award XP
    if (allComplete && !existingLog?.all_tasks_complete) {
      const dailyXP = session.challenge_type === '75_hard' ? 25 : 15;
      await supabase.rpc('increment_xp', { p_user_id: user.id, p_xp_amount: dailyXP });

      // Check for milestone achievements
      await checkMilestones(supabase, user.id, session, dayNumber);
    }

    return NextResponse.json({
      success: true,
      log: { ...log, all_tasks_complete: allComplete },
      day_number: dayNumber,
      all_complete: allComplete,
    });
  } catch (error) {
    console.error('Challenge log error:', error);
    return NextResponse.json({ error: 'Failed to log task' }, { status: 500 });
  }
}

function checkAllComplete(challengeType: string, log: any): boolean {
  if (challengeType === '75_hard') {
    return (
      log.workout_1_done &&
      log.workout_2_outdoor_done &&
      log.diet_followed &&
      log.water_goal_done &&
      log.reading_done &&
      log.progress_photo &&
      log.no_alcohol
    );
  }
  // 75 Soft
  return (
    log.workout_1_done &&
    log.diet_followed &&
    log.water_goal_done &&
    log.reading_done
    // reflection is encouraged but not required for completion
  );
}

async function checkMilestones(
  supabase: any,
  userId: string,
  session: any,
  dayNumber: number
) {
  const milestones = [
    { day: 7, title: 'One Week Unbroken', xp_hard: 300, xp_soft: 200 },
    { day: 30, title: 'Elite Discipline', xp_hard: 700, xp_soft: 500 },
    { day: 50, title: 'Rare Mentality', xp_hard: 1000, xp_soft: 700 },
    { day: 75, title: 'Challenge Complete!', xp_hard: 2000, xp_soft: 1200 },
  ];

  const milestone = milestones.find(m => m.day === dayNumber);
  if (!milestone) return;

  const xp = session.challenge_type === '75_hard' ? milestone.xp_hard : milestone.xp_soft;
  
  await supabase.rpc('increment_xp', { p_user_id: userId, p_xp_amount: xp });

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'achievement',
    title: `🏆 ${milestone.title}`,
    message: `Day ${dayNumber} complete! You earned ${xp} XP.`,
  });

  // Mark challenge as completed at day 75
  if (dayNumber === 75) {
    await supabase
      .from('challenge_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString().split('T')[0],
      })
      .eq('id', session.id);
  }
}

