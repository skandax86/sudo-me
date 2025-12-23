import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ChallengeType } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challenge_type, start_date }: { challenge_type: ChallengeType; start_date: string } = await request.json();

    if (!challenge_type || !['75_hard', '75_soft'].includes(challenge_type)) {
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }

    // Check for existing active challenge
    const { data: existingChallenge } = await supabase
      .from('challenge_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingChallenge) {
      return NextResponse.json({ 
        error: 'You already have an active challenge. Complete or pause it first.',
        existing_session_id: existingChallenge.id,
      }, { status: 409 });
    }

    // Create new challenge session
    const { data: session, error } = await supabase
      .from('challenge_sessions')
      .insert({
        user_id: user.id,
        challenge_type,
        start_date: start_date || new Date().toISOString().split('T')[0],
        current_day: 1,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return NextResponse.json({ error: 'Failed to start challenge' }, { status: 500 });
    }

    // Update profile template type
    await supabase
      .from('profiles')
      .update({ template_type: challenge_type })
      .eq('id', user.id);

    // Create challenge-specific habits
    const challengeHabits = getChallengeHabits(challenge_type, user.id);
    
    // Add challenge habits (they stack with existing habits)
    for (const habit of challengeHabits) {
      await supabase.from('habits').upsert(habit, {
        onConflict: 'user_id,name',
        ignoreDuplicates: true,
      });
    }

    // Award XP for starting
    const startXP = challenge_type === '75_hard' ? 100 : 50;
    await supabase.rpc('increment_xp', { p_user_id: user.id, p_xp_amount: startXP });

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'achievement',
      title: '🔥 Challenge Started!',
      message: `You've begun ${challenge_type === '75_hard' ? '75 Hard' : '75 Soft'}. Day 1 starts today. No excuses.`,
    });

    return NextResponse.json({
      success: true,
      session,
      xp_earned: startXP,
      message: `${challenge_type === '75_hard' ? '75 Hard' : '75 Soft'} challenge started!`,
    });
  } catch (error) {
    console.error('Challenge start error:', error);
    return NextResponse.json({ error: 'Failed to start challenge' }, { status: 500 });
  }
}

// Helper: Get default habits for challenge
function getChallengeHabits(type: ChallengeType, userId: string) {
  const baseHabits = [
    { user_id: userId, name: 'Workout 1', icon: '🏋️', weight: 20, domain: 'health', sort_order: 100 },
    { user_id: userId, name: 'Follow Diet', icon: '🥗', weight: 15, domain: 'health', sort_order: 101 },
    { user_id: userId, name: 'Hydration Goal', icon: '💧', weight: 10, domain: 'health', sort_order: 102 },
    { user_id: userId, name: 'Read 10 Pages', icon: '📖', weight: 15, domain: 'learning', sort_order: 103 },
  ];

  if (type === '75_hard') {
    return [
      ...baseHabits,
      { user_id: userId, name: 'Workout 2 (Outdoor)', icon: '🏃', weight: 20, domain: 'health', sort_order: 104 },
      { user_id: userId, name: 'Progress Photo', icon: '📸', weight: 10, domain: 'health', sort_order: 105 },
      { user_id: userId, name: 'No Alcohol', icon: '🚫', weight: 10, domain: 'discipline', sort_order: 106 },
    ];
  } else {
    return [
      ...baseHabits,
      { user_id: userId, name: 'Daily Reflection', icon: '✍️', weight: 10, domain: 'personal', sort_order: 104 },
    ];
  }
}

