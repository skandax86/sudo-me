import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LearningLogInput } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: LearningLogInput = await request.json();
    
    if (!body.date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const { data: log, error } = await supabase
      .from('learning_logs')
      .upsert({
        user_id: user.id,
        date: body.date,
        leetcode_solved: body.leetcode_solved || 0,
        study_hours: body.study_hours || 0,
        pages_read: body.pages_read || 0,
        topic: body.topic || null,
        note: body.note || null,
      }, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (error) {
      console.error('Learning log error:', error);
      return NextResponse.json({ error: 'Failed to log learning' }, { status: 500 });
    }

    // Update discipline score
    await updateDisciplineScore(supabase, user.id, body.date);

    return NextResponse.json({
      success: true,
      log,
      message: 'Learning logged',
    });
  } catch (error) {
    console.error('Learning API error:', error);
    return NextResponse.json({ error: 'Failed to log learning' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (date) {
      const { data: log } = await supabase
        .from('learning_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      return NextResponse.json(log || { leetcode_solved: 0, pages_read: 0, study_hours: 0 });
    }

    // Get last N days
    const { data: logs } = await supabase
      .from('learning_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(days);

    // Calculate totals
    const totals = (logs || []).reduce((acc, log) => ({
      leetcode_solved: acc.leetcode_solved + (log.leetcode_solved || 0),
      pages_read: acc.pages_read + (log.pages_read || 0),
      study_hours: acc.study_hours + (log.study_hours || 0),
    }), { leetcode_solved: 0, pages_read: 0, study_hours: 0 });

    return NextResponse.json({ logs, totals });
  } catch (error) {
    console.error('Learning GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning logs' }, { status: 500 });
  }
}

// Helper to update discipline score
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
  }
}

