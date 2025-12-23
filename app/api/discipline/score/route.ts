import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Try to get cached score first
    const { data: cachedScore } = await supabase
      .from('discipline_scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (cachedScore) {
      return NextResponse.json({
        habits: cachedScore.habits_score,
        fitness: cachedScore.fitness_score,
        learning: cachedScore.learning_score,
        total: cachedScore.total_score,
        cached: true,
      });
    }

    // Calculate fresh score
    const { data: score } = await supabase.rpc('calculate_discipline_score', {
      p_user_id: user.id,
      p_date: date,
    });

    if (score && score.length > 0) {
      // Cache the score
      await supabase.from('discipline_scores').upsert({
        user_id: user.id,
        date,
        habits_score: score[0].habits_score,
        fitness_score: score[0].fitness_score,
        learning_score: score[0].learning_score,
        total_score: score[0].total_score,
      }, { onConflict: 'user_id,date' });

      return NextResponse.json({
        habits: score[0].habits_score,
        fitness: score[0].fitness_score,
        learning: score[0].learning_score,
        total: score[0].total_score,
        cached: false,
      });
    }

    return NextResponse.json({
      habits: 0,
      fitness: 0,
      learning: 0,
      total: 0,
    });
  } catch (error) {
    console.error('Discipline score error:', error);
    return NextResponse.json({ error: 'Failed to calculate score' }, { status: 500 });
  }
}

// Get weekly/monthly trends
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { period = 'week' } = await request.json();
    
    const today = new Date();
    let startDate: string;
    
    if (period === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      startDate = weekStart.toISOString().split('T')[0];
    } else {
      startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    }

    const { data: scores } = await supabase
      .from('discipline_scores')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .order('date', { ascending: true });

    const averageScore = scores && scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.total_score, 0) / scores.length)
      : 0;

    return NextResponse.json({
      period,
      scores,
      average: averageScore,
      days_logged: scores?.length || 0,
    });
  } catch (error) {
    console.error('Discipline trends error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}

