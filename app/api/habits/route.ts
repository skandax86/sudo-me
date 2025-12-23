import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET all habits with today's logs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get habits with logs for the specified date
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select(`
        *,
        habit_logs(id, completed, date)
      `)
      .eq('user_id', user.id)
      .eq('active', true)
      .eq('habit_logs.date', date)
      .order('sort_order', { ascending: true });

    if (habitsError) {
      return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }

    // Format response
    const formattedHabits = habits?.map(habit => ({
      ...habit,
      completed: habit.habit_logs?.[0]?.completed || false,
      log_id: habit.habit_logs?.[0]?.id || null,
    }));

    const completed = formattedHabits?.filter(h => h.completed).length || 0;
    const total = formattedHabits?.length || 0;

    return NextResponse.json({
      habits: formattedHabits,
      summary: {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Habits GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

// CREATE a new habit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, icon = '✅', weight = 10, domain = 'discipline' } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Habit name is required' }, { status: 400 });
    }

    // Get max sort_order
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

    if (error) {
      return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
    }

    return NextResponse.json({ success: true, habit });
  } catch (error) {
    console.error('Habit POST error:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}

// UPDATE a habit
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    }

    const { data: habit, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
    }

    return NextResponse.json({ success: true, habit });
  } catch (error) {
    console.error('Habit PUT error:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

// DELETE (soft delete - deactivate)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    }

    // Soft delete
    const { error } = await supabase
      .from('habits')
      .update({ active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Habit DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}

