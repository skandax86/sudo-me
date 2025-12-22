import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GOOGLE_AI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  console.log('[DEBUG API] generate-plan POST called');
  try {
    const data = await request.json();
    console.log('[DEBUG API] Received data:', JSON.stringify(data, null, 2));

    // If no API key, return a fallback plan
    if (!genAI) {
      console.log('[DEBUG API] No AI API key - using fallback plan');
      return NextResponse.json({ 
        plan: generateFallbackPlan(data),
        source: 'fallback'
      });
    }

    console.log('[DEBUG API] Using AI model to generate plan');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a personal development coach AI. Based on the user's preferences, generate a personalized transformation plan.

User Profile:
- Name: ${data.userName || 'User'}
- Age: ${data.age}
- Primary Focus: ${data.primaryFocus || 'Not specified'}
- Specific Goals: ${[...(data.specificGoals || []), ...(data.customGoals || [])].join(', ') || 'Not specified'}
- Current Level: ${data.currentLevel || 'Not specified'}
- Biggest Challenge: ${data.biggestChallenge || 'Not specified'}
- Time Commitment: ${data.hoursPerDay} hours/day, ${data.daysPerWeek} days/week
- Plan Duration: ${data.planDuration} days
- Wake Up Time: ${data.wakeUpTime}
- Sleep Time: ${data.sleepTime}
- Work Schedule: ${data.workSchedule}
- Tracking Areas: ${[...(data.trackingAreas || []), ...(data.customTracking || [])].join(', ') || 'Not specified'}
- Monthly Budget: ₹${data.monthlyBudget || data.budget}

Generate a personalized plan in this exact JSON format:
{
  "duration": ${data.planDuration || 90},
  "planName": "string (creative name for their journey)",
  "dailyHabits": [
    { "name": "string", "target": "string (e.g., 'Daily', '4x/week')", "icon": "emoji", "time": "string (when to do it)" }
  ],
  "weeklyGoals": ["string array of 3-5 weekly focus areas"],
  "morningRoutine": [
    { "activity": "string", "duration": "string", "icon": "emoji" }
  ],
  "eveningRoutine": [
    { "activity": "string", "duration": "string", "icon": "emoji" }
  ],
  "tracking": [
    { "name": "string", "frequency": "Daily/Weekly", "metric": "string" }
  ],
  "milestones": {
    "week1": "string (what to achieve)",
    "week4": "string",
    "week8": "string (if 60+ day plan)",
    "week12": "string (if 90 day plan)"
  },
  "budgetAllocation": {
    "essentials": number (percentage),
    "savings": number,
    "investments": number,
    "wants": number,
    "goals": number
  },
  "coachingTip": "string (personalized advice)",
  "wakeTime": "${data.wakeUpTime}",
  "sleepTime": "${data.sleepTime}"
}

Make the plan realistic, achievable, and tailored to their specific goals and schedule. Be specific with activities.
Return ONLY valid JSON, no markdown or explanation.
`;

    console.log('[DEBUG API] Calling AI model...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('[DEBUG API] AI response received, length:', text.length);

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('[DEBUG API] Successfully parsed AI response as JSON');
      const plan = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ plan, source: 'ai' });
    }

    // Fallback if parsing fails
    console.log('[DEBUG API] Could not parse AI response - using fallback');
    return NextResponse.json({ 
      plan: generateFallbackPlan(data),
      source: 'fallback'
    });

  } catch (error) {
    console.error('[DEBUG API] Error generating plan:', error);
    return NextResponse.json({ 
      plan: generateFallbackPlan({}),
      source: 'fallback',
      error: 'Failed to generate AI plan'
    });
  }
}

function generateFallbackPlan(data: any) {
  const intensity = data.intensity || 'moderate';
  const trackingAreas = data.trackingAreas || ['habits', 'fitness'];
  const goals = data.goals || [];
  
  const habits = [];
  const morningRoutine = [];
  const eveningRoutine = [];
  const tracking = [];

  // Base habits based on intensity
  if (intensity !== 'light') {
    habits.push({ name: 'Wake up early', target: 'Daily', icon: '⏰', time: data.wakeUpTime || '06:00' });
    morningRoutine.push({ activity: 'Hydrate', duration: '5 min', icon: '💧' });
  }

  if (trackingAreas.includes('habits')) {
    habits.push({ name: 'No phone first hour', target: 'Daily', icon: '📵', time: 'Morning' });
    morningRoutine.push({ activity: 'Mindfulness', duration: '10 min', icon: '🧘' });
  }

  if (trackingAreas.includes('fitness')) {
    const workoutFreq = intensity === 'extreme' ? '6x/week' : intensity === 'intense' ? '5x/week' : '4x/week';
    habits.push({ name: 'Workout', target: workoutFreq, icon: '💪', time: 'Morning/Evening' });
    habits.push({ name: 'Drink water', target: '8 glasses', icon: '💧', time: 'Throughout day' });
    tracking.push({ name: 'Workouts', frequency: 'Daily', metric: 'Sessions completed' });
  }

  if (trackingAreas.includes('learning')) {
    habits.push({ name: 'Read', target: '30 min/day', icon: '📚', time: 'Evening' });
    eveningRoutine.push({ activity: 'Reading', duration: '30 min', icon: '📖' });
    tracking.push({ name: 'Learning', frequency: 'Daily', metric: 'Hours spent' });
  }

  if (trackingAreas.includes('finance')) {
    habits.push({ name: 'Track expenses', target: 'Daily', icon: '💰', time: 'Evening' });
    tracking.push({ name: 'Budget', frequency: 'Weekly', metric: 'Spending vs budget' });
  }

  if (trackingAreas.includes('calories')) {
    habits.push({ name: 'Log meals', target: 'Daily', icon: '🍎', time: 'After each meal' });
    tracking.push({ name: 'Nutrition', frequency: 'Daily', metric: 'Calories' });
  }

  if (trackingAreas.includes('sleep')) {
    habits.push({ name: 'Sleep on time', target: 'Daily', icon: '😴', time: data.sleepTime || '22:00' });
    tracking.push({ name: 'Sleep', frequency: 'Daily', metric: 'Hours slept' });
  }

  if (trackingAreas.includes('mood')) {
    eveningRoutine.push({ activity: 'Journal', duration: '10 min', icon: '📝' });
    tracking.push({ name: 'Mood', frequency: 'Daily', metric: 'Rating 1-5' });
  }

  // Add evening routine basics
  eveningRoutine.push({ activity: 'Plan tomorrow', duration: '10 min', icon: '📋' });

  const duration = intensity === 'light' ? 30 : intensity === 'moderate' ? 60 : 90;

  return {
    duration,
    planName: `${duration}-Day ${intensity.charAt(0).toUpperCase() + intensity.slice(1)} Transformation`,
    dailyHabits: habits,
    weeklyGoals: goals.slice(0, 5).map((g: string) => {
      const goalLabels: Record<string, string> = {
        'weight_loss': 'Lose weight steadily',
        'muscle_gain': 'Build muscle mass',
        'save_money': 'Increase savings',
        'invest': 'Start investing',
        'new_job': 'Career advancement',
        'learn_skill': 'Learn new skills',
        'wake_early': 'Consistent wake time',
        'read_more': 'Read daily',
        'meditation': 'Daily meditation',
        'quit_habit': 'Break bad habits',
        'travel': 'Plan trips',
        'relationships': 'Nurture connections',
      };
      return goalLabels[g] || g;
    }),
    morningRoutine,
    eveningRoutine,
    tracking,
    milestones: {
      week1: 'Establish daily routine',
      week4: 'Build consistency, see first results',
      ...(duration >= 60 ? { week8: 'Major progress visible' } : {}),
      ...(duration >= 90 ? { week12: 'Transformation complete' } : {}),
    },
    budgetAllocation: {
      essentials: 30,
      savings: 20,
      investments: 20,
      wants: 15,
      goals: 15,
    },
    coachingTip: `Start with ${intensity === 'light' ? '2-3' : '4-5'} key habits and build from there. Consistency beats intensity!`,
    wakeTime: data.wakeUpTime || '06:00',
    sleepTime: data.sleepTime || '22:00',
  };
}

