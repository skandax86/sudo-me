import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WorkoutInput } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: WorkoutInput = await request.json();
    
    // Validate required fields
    if (!body.date || !body.workout_type) {
      return NextResponse.json(
        { error: 'Missing required fields: date, workout_type' },
        { status: 400 }
      );
    }

    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .upsert({
        user_id: user.id,
        workout_date: body.date,
        workout_type: body.workout_type,
        program: body.program || null,
        duration_mins: body.duration_min || null,
        effort: body.effort || null,
      }, {
        onConflict: 'user_id,workout_date',
      })
      .select()
      .single();

    if (workoutError) {
      console.error('Workout creation error:', workoutError);
      return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
    }

    // Add exercises if provided
    if (body.exercises && body.exercises.length > 0) {
      // Delete existing exercises for this workout
      await supabase
        .from('exercise_logs')
        .delete()
        .eq('workout_id', workout.id);

      // Insert new exercises
      const exerciseLogs = body.exercises.map((ex, index) => ({
        workout_id: workout.id,
        exercise: ex.exercise,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        unit: 'kg',
        sort_order: index,
      }));

      const { error: exerciseError } = await supabase
        .from('exercise_logs')
        .insert(exerciseLogs);

      if (exerciseError) {
        console.error('Exercise logs error:', exerciseError);
      }
    }

    // Update discipline score
    await updateDisciplineScore(supabase, user.id, body.date);

    return NextResponse.json({
      success: true,
      workout,
      message: 'Workout logged successfully',
    });
  } catch (error) {
    console.error('Workout API error:', error);
    return NextResponse.json({ error: 'Failed to log workout' }, { status: 500 });
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
    const limit = parseInt(searchParams.get('limit') || '7', 10);

    let query = supabase
      .from('workouts')
      .select('*, exercise_logs(*)')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false });

    if (date) {
      query = query.eq('workout_date', date);
    } else {
      query = query.limit(limit);
    }

    const { data: workouts, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
    }

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Workout GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

// Helper to update discipline score after workout
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

