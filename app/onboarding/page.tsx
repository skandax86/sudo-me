'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';

type Step = 
  | 'welcome' 
  | 'focus_areas' 
  | 'goals_obstacles'  // Merged: Goals + Challenges in one step
  | 'commitment'
  | 'schedule'
  | 'preview'          // New: Show what plan will include
  | 'tracking'
  | 'generating' 
  | 'review';

interface FocusArea {
  id: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

interface OnboardingData {
  focusAreas: string[];
  goalsByFocus: Record<string, string[]>;
  customGoals: Record<string, string[]>;
  challenges: Record<string, string>;
  hoursPerDay: number;
  daysPerWeek: number;
  planDuration: number;
  wakeUpTime: string;
  sleepTime: string;
  workSchedule: string;
  age: number;
  trackingAreas: string[];
  customTracking: string[];
  monthlyBudget: number;
}

// Focus area definitions
const focusAreaOptions: FocusArea[] = [
  { id: 'health', label: 'Health & Fitness', icon: '💪', desc: 'Get fit, lose weight, build strength', color: 'from-green-500 to-emerald-500' },
  { id: 'career', label: 'Career & Work', icon: '💼', desc: 'Grow professionally, get promoted', color: 'from-blue-500 to-indigo-500' },
  { id: 'finance', label: 'Money & Wealth', icon: '💰', desc: 'Save, invest, build wealth', color: 'from-yellow-500 to-amber-500' },
  { id: 'discipline', label: 'Discipline & Habits', icon: '🎯', desc: 'Build routines, self-control', color: 'from-purple-500 to-pink-500' },
  { id: 'learning', label: 'Learning & Skills', icon: '📚', desc: 'Learn new things, upskill', color: 'from-cyan-500 to-blue-500' },
  { id: 'personal', label: 'Personal Growth', icon: '✨', desc: 'Confidence, relationships', color: 'from-rose-500 to-red-500' },
];

// Goals organized by focus area
const goalsByFocus: Record<string, Array<{ id: string; label: string; icon: string }>> = {
  health: [
    { id: 'lose_weight', label: 'Lose weight', icon: '⚡' },
    { id: 'build_muscle', label: 'Build muscle', icon: '💪' },
    { id: 'improve_stamina', label: 'Improve stamina', icon: '🏃' },
    { id: 'eat_healthier', label: 'Eat healthier', icon: '🥗' },
    { id: 'better_sleep', label: 'Sleep better', icon: '😴' },
    { id: 'more_energy', label: 'Have more energy', icon: '🔋' },
    { id: 'flexibility', label: 'Improve flexibility', icon: '🧘' },
    { id: 'quit_smoking', label: 'Quit smoking', icon: '🚭' },
  ],
  career: [
    { id: 'get_promoted', label: 'Get promoted', icon: '📈' },
    { id: 'new_job', label: 'Find new job', icon: '💼' },
    { id: 'learn_skills', label: 'Learn new skills', icon: '🧠' },
    { id: 'build_network', label: 'Build network', icon: '🤝' },
    { id: 'start_business', label: 'Start a business', icon: '🚀' },
    { id: 'get_certified', label: 'Get certified', icon: '📜' },
    { id: 'improve_performance', label: 'Better performance', icon: '⭐' },
    { id: 'work_life_balance', label: 'Work-life balance', icon: '⚖️' },
  ],
  finance: [
    { id: 'save_money', label: 'Save more money', icon: '💵' },
    { id: 'pay_debt', label: 'Pay off debt', icon: '💳' },
    { id: 'start_investing', label: 'Start investing', icon: '📊' },
    { id: 'emergency_fund', label: 'Emergency fund', icon: '🏦' },
    { id: 'budget_better', label: 'Budget better', icon: '📋' },
    { id: 'increase_income', label: 'Increase income', icon: '💰' },
    { id: 'financial_freedom', label: 'Financial freedom', icon: '🦅' },
    { id: 'buy_asset', label: 'Buy an asset', icon: '🏠' },
  ],
  discipline: [
    { id: 'wake_early', label: 'Wake up early', icon: '🌅' },
    { id: 'build_routine', label: 'Build routine', icon: '📅' },
    { id: 'reduce_phone', label: 'Less phone time', icon: '📵' },
    { id: 'meditate', label: 'Meditate daily', icon: '🧘' },
    { id: 'read_more', label: 'Read more books', icon: '📚' },
    { id: 'journal', label: 'Journal regularly', icon: '📝' },
    { id: 'stop_procrastinating', label: 'Stop procrastinating', icon: '⏰' },
    { id: 'control_impulses', label: 'Control impulses', icon: '🎯' },
  ],
  learning: [
    { id: 'learn_coding', label: 'Learn coding', icon: '💻' },
    { id: 'learn_language', label: 'Learn language', icon: '🗣️' },
    { id: 'online_courses', label: 'Complete courses', icon: '🎓' },
    { id: 'read_books', label: 'Read 12+ books', icon: '📖' },
    { id: 'creative_skill', label: 'Creative skill', icon: '🎨' },
    { id: 'public_speaking', label: 'Public speaking', icon: '🎤' },
    { id: 'writing', label: 'Improve writing', icon: '✍️' },
    { id: 'problem_solving', label: 'Problem solving', icon: '🧩' },
  ],
  personal: [
    { id: 'more_confident', label: 'Be more confident', icon: '🦁' },
    { id: 'better_relationships', label: 'Better relationships', icon: '❤️' },
    { id: 'be_social', label: 'Be more social', icon: '👥' },
    { id: 'travel_more', label: 'Travel more', icon: '✈️' },
    { id: 'find_purpose', label: 'Find purpose', icon: '🧭' },
    { id: 'mental_health', label: 'Mental health', icon: '🧠' },
    { id: 'hobbies', label: 'Develop hobbies', icon: '🎸' },
    { id: 'appearance', label: 'Look better', icon: '✨' },
  ],
};

// What I want to work on (positive framing)
const improvementsByFocus: Record<string, Array<{ id: string; label: string; icon: string }>> = {
  health: [
    { id: 'find_time', label: 'Make time for fitness', icon: '⏰' },
    { id: 'stay_motivated', label: 'Stay motivated daily', icon: '🔥' },
    { id: 'learn_workouts', label: 'Learn proper workouts', icon: '📚' },
    { id: 'build_consistency', label: 'Build consistency', icon: '📅' },
    { id: 'eat_better', label: 'Eat healthier meals', icon: '🥗' },
  ],
  career: [
    { id: 'find_direction', label: 'Find my career path', icon: '🧭' },
    { id: 'break_through', label: 'Break through barriers', icon: '🚀' },
    { id: 'gain_skills', label: 'Gain new skills', icon: '🧠' },
    { id: 'build_confidence', label: 'Build confidence', icon: '💪' },
    { id: 'grow_network', label: 'Grow my network', icon: '🤝' },
  ],
  finance: [
    { id: 'start_saving', label: 'Start saving regularly', icon: '🐷' },
    { id: 'control_spending', label: 'Control my spending', icon: '💳' },
    { id: 'become_debt_free', label: 'Become debt-free', icon: '🎯' },
    { id: 'learn_investing', label: 'Learn to invest', icon: '📈' },
    { id: 'budget_better', label: 'Budget smarter', icon: '📊' },
  ],
  discipline: [
    { id: 'beat_procrastination', label: 'Beat procrastination', icon: '⚡' },
    { id: 'digital_detox', label: 'Digital detox', icon: '📵' },
    { id: 'create_routine', label: 'Create a routine', icon: '📋' },
    { id: 'master_self_control', label: 'Master self-control', icon: '🎯' },
    { id: 'stay_focused', label: 'Stay focused', icon: '🔍' },
  ],
  learning: [
    { id: 'make_time', label: 'Make time to learn', icon: '⏰' },
    { id: 'focus_path', label: 'Focus on one path', icon: '🛤️' },
    { id: 'retain_knowledge', label: 'Retain what I learn', icon: '🧠' },
    { id: 'stay_curious', label: 'Stay curious & engaged', icon: '✨' },
    { id: 'practice_daily', label: 'Practice daily', icon: '💻' },
  ],
  personal: [
    { id: 'boost_confidence', label: 'Boost my confidence', icon: '🦁' },
    { id: 'manage_stress', label: 'Manage stress better', icon: '🧘' },
    { id: 'connect_people', label: 'Connect with people', icon: '❤️' },
    { id: 'believe_myself', label: 'Believe in myself', icon: '⭐' },
    { id: 'find_balance', label: 'Find life balance', icon: '⚖️' },
  ],
};

// Tracking by focus
const trackingByFocus: Record<string, Array<{ id: string; label: string; icon: string }>> = {
  health: [
    { id: 'weight', label: 'Weight', icon: '⚖️' },
    { id: 'workouts', label: 'Workouts', icon: '🏋️' },
    { id: 'calories', label: 'Calories', icon: '🍎' },
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
  ],
  career: [
    { id: 'tasks', label: 'Tasks', icon: '✔️' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'networking', label: 'Networking', icon: '🤝' },
    { id: 'projects', label: 'Projects', icon: '📁' },
  ],
  finance: [
    { id: 'spending', label: 'Spending', icon: '💳' },
    { id: 'savings', label: 'Savings', icon: '🐷' },
    { id: 'investments', label: 'Investments', icon: '📈' },
    { id: 'budget', label: 'Budget', icon: '📊' },
  ],
  discipline: [
    { id: 'habits', label: 'Habits', icon: '✅' },
    { id: 'wake_time', label: 'Wake Time', icon: '⏰' },
    { id: 'screen_time', label: 'Screen Time', icon: '📱' },
    { id: 'meditation', label: 'Meditation', icon: '🧘' },
  ],
  learning: [
    { id: 'study_hours', label: 'Study Hours', icon: '📖' },
    { id: 'courses', label: 'Courses', icon: '🎓' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'practice', label: 'Practice', icon: '💻' },
  ],
  personal: [
    { id: 'mood', label: 'Mood', icon: '😊' },
    { id: 'gratitude', label: 'Gratitude', icon: '🙏' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'journal', label: 'Journal', icon: '📝' },
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStepInternal] = useState<Step>('welcome');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const [customGoalInputs, setCustomGoalInputs] = useState<Record<string, string>>({});
  const [customTrackingInput, setCustomTrackingInput] = useState('');

  // DEBUG: Wrapper to log step changes with stack trace
  const setStep = (newStep: Step) => {
    console.log('[DEBUG STEP CHANGE] From:', step, '→ To:', newStep);
    console.log('[DEBUG STEP CHANGE] Stack trace:', new Error().stack);
    setStepInternal(newStep);
  };

  // DEBUG: Log step changes
  console.log('[DEBUG] Current step:', step, '| Loading:', loading, '| Saving:', saving);

  // DEBUG: Detect component unmount
  useEffect(() => {
    console.log('[DEBUG] OnboardingPage MOUNTED');
    return () => {
      console.log('[DEBUG] OnboardingPage UNMOUNTING - this may indicate unexpected navigation');
    };
  }, []);
  
  const [data, setData] = useState<OnboardingData>({
    focusAreas: [],
    goalsByFocus: {},
    customGoals: {},
    challenges: {},
    hoursPerDay: 1,
    daysPerWeek: 5,
    planDuration: 90,
    wakeUpTime: '06:00',
    sleepTime: '22:00',
    workSchedule: '9-5',
    age: 25,
    trackingAreas: [],
    customTracking: [],
    monthlyBudget: 50000,
  });

  useEffect(() => {
    console.log('[DEBUG] useEffect running - checking Supabase ready...');
    
    if (!isSupabaseReady()) {
      console.log('[DEBUG] Supabase NOT ready - redirecting to /setup');
      router.push('/setup');
      return;
    }
    console.log('[DEBUG] Supabase IS ready');

    const loadUser = async () => {
      console.log('[DEBUG] loadUser() called');
      try {
        const supabase = getSupabaseClient();
        console.log('[DEBUG] Getting user from Supabase auth...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        console.log('[DEBUG] Auth result - user:', user?.id || 'null', '| authError:', authError?.message || 'none');
        
        if (!user) {
          console.log('[DEBUG] No user found - redirecting to /auth/login');
          router.push('/auth/login');
          return;
        }

        console.log('[DEBUG] Fetching profile for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        console.log('[DEBUG] Profile result:', profile, '| profileError:', profileError?.message || 'none');

        if (profile?.name) {
          setUserName(profile.name);
        }
      } catch (err) {
        console.error('[DEBUG] Error loading user:', err);
      } finally {
        console.log('[DEBUG] loadUser() complete - setting loading to false');
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const toggleFocusArea = (id: string) => {
    const newAreas = data.focusAreas.includes(id)
      ? data.focusAreas.filter(a => a !== id)
      : [...data.focusAreas, id];
    setData({ ...data, focusAreas: newAreas });
  };

  const toggleGoal = (focusId: string, goalId: string) => {
    const current = data.goalsByFocus[focusId] || [];
    const updated = current.includes(goalId)
      ? current.filter(g => g !== goalId)
      : [...current, goalId];
    setData({
      ...data,
      goalsByFocus: { ...data.goalsByFocus, [focusId]: updated },
    });
  };

  const addCustomGoal = (focusId: string) => {
    const input = customGoalInputs[focusId]?.trim();
    if (input) {
      const current = data.customGoals[focusId] || [];
      setData({
        ...data,
        customGoals: { ...data.customGoals, [focusId]: [...current, input] },
      });
      setCustomGoalInputs({ ...customGoalInputs, [focusId]: '' });
    }
  };

  const removeCustomGoal = (focusId: string, index: number) => {
    const current = data.customGoals[focusId] || [];
    setData({
      ...data,
      customGoals: { ...data.customGoals, [focusId]: current.filter((_, i) => i !== index) },
    });
  };

  const setChallenge = (focusId: string, challengeId: string) => {
    setData({
      ...data,
      challenges: { ...data.challenges, [focusId]: challengeId },
    });
  };

  const toggleTracking = (id: string) => {
    const updated = data.trackingAreas.includes(id)
      ? data.trackingAreas.filter(t => t !== id)
      : [...data.trackingAreas, id];
    setData({ ...data, trackingAreas: updated });
  };

  const addCustomTracking = () => {
    if (customTrackingInput.trim()) {
      setData({ ...data, customTracking: [...data.customTracking, customTrackingInput.trim()] });
      setCustomTrackingInput('');
    }
  };

  const getTotalGoals = () => {
    const fromFocus = Object.values(data.goalsByFocus).flat().length;
    const custom = Object.values(data.customGoals).flat().length;
    return fromFocus + custom;
  };

  const handleGeneratePlan = async () => {
    console.log('[DEBUG] handleGeneratePlan() called - transitioning to generating step');
    console.log('[DEBUG] Current data state:', JSON.stringify(data, null, 2));
    setStep('generating');
    
    try {
      console.log('[DEBUG] Calling /api/generate-plan...');
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userName,
        }),
      });

      console.log('[DEBUG] API response status:', response.status);
      const result = await response.json();
      console.log('[DEBUG] API result:', result);
      
      const plan = result.plan || generateFallbackPlan();
      console.log('[DEBUG] Setting generated plan and transitioning to review step');
      setGeneratedPlan(plan);
      setStep('review');
    } catch (err) {
      console.error('[DEBUG] Error generating plan:', err);
      console.log('[DEBUG] Using fallback plan');
      setGeneratedPlan(generateFallbackPlan());
      setStep('review');
    }
  };

  const generateFallbackPlan = () => {
    const allGoals: string[] = [];
    const habits: Array<{ name: string; icon: string; target: string }> = [];

    data.focusAreas.forEach(focusId => {
      const focusGoals = data.goalsByFocus[focusId] || [];
      const goals = goalsByFocus[focusId] || [];
      
      focusGoals.forEach(gId => {
        const goal = goals.find(g => g.id === gId);
        if (goal) {
          allGoals.push(goal.label);
          habits.push({ name: goal.label, icon: goal.icon, target: 'Daily' });
        }
      });

      (data.customGoals[focusId] || []).forEach(g => {
        allGoals.push(g);
        habits.push({ name: g, icon: '🎯', target: 'Daily' });
      });
    });

    return {
      duration: data.planDuration,
      planName: `${data.planDuration}-Day Transformation Plan`,
      dailyHabits: habits.slice(0, 6),
      weeklyGoals: allGoals.slice(0, 5),
      morningRoutine: [
        { activity: 'Wake up', duration: `at ${data.wakeUpTime}`, icon: '⏰' },
        { activity: 'Morning routine', duration: '30 min', icon: '🌅' },
      ],
      eveningRoutine: [
        { activity: 'Review day', duration: '10 min', icon: '📝' },
        { activity: 'Plan tomorrow', duration: '10 min', icon: '📋' },
      ],
      tracking: data.trackingAreas.slice(0, 5).map(id => ({ name: id, frequency: 'Daily' })),
      milestones: {
        week1: 'Build the foundation',
        week4: 'See first results',
        ...(data.planDuration >= 60 ? { week8: 'Major progress' } : {}),
        ...(data.planDuration >= 90 ? { week12: 'Transformation complete' } : {}),
      },
      coachingTip: `Focus on consistency. You committed to ${data.hoursPerDay} hour(s)/day, ${data.daysPerWeek} days/week.`,
      wakeTime: data.wakeUpTime,
      sleepTime: data.sleepTime,
    };
  };

  const savePlanAndContinue = async () => {
    console.log('[DEBUG] savePlanAndContinue() called');
    setSaving(true);
    setError('');
    
    try {
      const supabase = getSupabaseClient();
      console.log('[DEBUG] Getting user for save...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('[DEBUG] Save - user:', user?.id || 'null', '| authError:', authError?.message || 'none');
      
      if (!user) {
        console.log('[DEBUG] No user in save - redirecting to /auth/login');
        router.push('/auth/login');
        return;
      }

      // First check if the columns exist
      console.log('[DEBUG] Checking profile exists...');
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      console.log('[DEBUG] Profile check - profile:', profile, '| fetchError:', fetchError?.message || 'none');

      if (fetchError) {
        console.error('[DEBUG] Fetch error:', fetchError);
        setError(`Database error: ${fetchError.message}`);
        return;
      }

      // Try to update with just basic fields first
      const updateData: Record<string, any> = {
        wake_time: data.wakeUpTime,
        start_date: new Date().toISOString().split('T')[0],
      };

      // Try to add onboarding fields (they might not exist yet)
      try {
        updateData.onboarding_complete = true;
        updateData.preferences = data;
        updateData.generated_plan = generatedPlan;
      } catch (e) {
        console.warn('[DEBUG] Extended fields not available');
      }

      console.log('[DEBUG] Updating profile with data:', updateData);
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        console.error('[DEBUG] Update error:', updateError);
        
        // If the columns don't exist, try update without generated_plan
        if (updateError.message.includes('column') && updateError.message.includes('generated_plan')) {
          console.log('[DEBUG] Trying update without generated_plan...');
          const { error: midError } = await supabase
            .from('profiles')
            .update({
              wake_time: data.wakeUpTime,
              start_date: new Date().toISOString().split('T')[0],
              onboarding_complete: true,
              preferences: data,
            })
            .eq('id', user.id);

          if (midError) {
            console.error('[DEBUG] Mid update error:', midError);
            // If preferences also fails, try truly minimal update
            if (midError.message.includes('column')) {
              console.log('[DEBUG] Trying minimal update with just onboarding_complete...');
              const { error: minimalError } = await supabase
                .from('profiles')
                .update({
                  wake_time: data.wakeUpTime,
                  start_date: new Date().toISOString().split('T')[0],
                  onboarding_complete: true,
                })
                .eq('id', user.id);

              if (minimalError) {
                console.error('[DEBUG] Minimal update error:', minimalError);
                setError(`Save failed: ${minimalError.message}`);
                return;
              }
            } else {
              setError(`Save failed: ${midError.message}`);
              return;
            }
          }
        } else if (updateError.message.includes('column')) {
          // Other column missing - try minimal with onboarding_complete
          console.log('[DEBUG] Trying minimal update...');
          const { error: minimalError } = await supabase
            .from('profiles')
            .update({
              wake_time: data.wakeUpTime,
              start_date: new Date().toISOString().split('T')[0],
              onboarding_complete: true,
            })
            .eq('id', user.id);

          if (minimalError) {
            console.error('[DEBUG] Minimal update error:', minimalError);
            setError(`Save failed: ${minimalError.message}`);
            return;
          }
        } else {
          setError(`Save failed: ${updateError.message}`);
          return;
        }
      }

      console.log('[DEBUG] Save successful - redirecting to /dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[DEBUG] Error saving plan:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      console.log('[DEBUG] savePlanAndContinue() complete - setSaving(false)');
      setSaving(false);
    }
  };

  // Progress calculation - V2 optimized flow (8 steps)
  const steps: Step[] = ['welcome', 'focus_areas', 'goals_obstacles', 'commitment', 'schedule', 'preview', 'tracking', 'generating', 'review'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;
  
  // Time estimate based on current step
  const getTimeEstimate = () => {
    const remainingSteps = steps.length - 1 - currentIndex;
    if (remainingSteps <= 0) return '';
    const minutes = Math.ceil(remainingSteps * 0.3); // ~20 seconds per step
    return minutes <= 1 ? '~1 min left' : `~${minutes} mins left`;
  };

  // Smart default tracking based on selected focus areas
  const getSmartDefaultTracking = () => {
    const defaults: string[] = [];
    if (data.focusAreas.includes('health')) defaults.push('workouts', 'water', 'sleep');
    if (data.focusAreas.includes('finance')) defaults.push('spending', 'savings');
    if (data.focusAreas.includes('discipline')) defaults.push('habits', 'wake_time');
    if (data.focusAreas.includes('career')) defaults.push('tasks', 'learning');
    if (data.focusAreas.includes('learning')) defaults.push('study_hours', 'books');
    if (data.focusAreas.includes('personal')) defaults.push('mood', 'journal');
    return defaults.slice(0, 5); // Max 5 defaults
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🚀</div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="text-7xl mb-6">👋</div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Welcome{userName ? `, ${userName}` : ''}!
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Let&apos;s create a personalized plan that fits YOUR life.
            </p>
            <p className="text-slate-500 mb-8">
              Takes about 2 minutes. Worth every second.
            </p>
            <button
              onClick={() => setStep('focus_areas')}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-lg font-bold rounded-2xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200"
            >
              Let&apos;s Begin →
            </button>
          </div>
        );

      case 'focus_areas':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                What areas do you want to improve?
              </h2>
              <p className="text-slate-500">Select one or more — we&apos;ll tailor your plan to each</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreaOptions.map((area) => (
                <button
                  key={area.id}
                  onClick={() => toggleFocusArea(area.id)}
                  className={`p-6 rounded-2xl text-left transition-all ${
                    data.focusAreas.includes(area.id)
                      ? `bg-gradient-to-r ${area.color} text-white shadow-lg scale-[1.02]`
                      : 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{area.icon}</span>
                    {data.focusAreas.includes(area.id) && (
                      <span className="bg-white/30 px-2 py-1 rounded-full text-sm font-bold">✓</span>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold mt-3 ${data.focusAreas.includes(area.id) ? 'text-white' : 'text-slate-800'}`}>
                    {area.label}
                  </h3>
                  <p className={`text-sm mt-1 ${data.focusAreas.includes(area.id) ? 'text-white/80' : 'text-slate-500'}`}>
                    {area.desc}
                  </p>
                </button>
              ))}
            </div>

            {data.focusAreas.length > 0 && (
              <div className="mt-6 p-4 bg-violet-50 rounded-xl text-center">
                <p className="text-violet-700 font-medium">
                  ✓ {data.focusAreas.length} area{data.focusAreas.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep('welcome')} className="px-6 py-3 text-slate-500 hover:text-slate-800">
                ← Back
              </button>
              <button
                onClick={() => setStep('goals_obstacles')}
                disabled={data.focusAreas.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        );

      case 'goals_obstacles':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Goals & What&apos;s Holding You Back
              </h2>
              <p className="text-slate-600">For each area, tell us what you want to achieve and your main obstacle</p>
            </div>
            
            <div className="space-y-8">
              {data.focusAreas.map((focusId) => {
                const area = focusAreaOptions.find(a => a.id === focusId)!;
                const goals = goalsByFocus[focusId] || [];
                const improvements = improvementsByFocus[focusId] || [];
                const selectedGoals = data.goalsByFocus[focusId] || [];
                const customGoals = data.customGoals[focusId] || [];
                const isComplete = (selectedGoals.length + customGoals.length) > 0 && data.challenges[focusId];

                return (
                  <div key={focusId} className={`bg-white rounded-2xl p-6 border-2 transition-all ${isComplete ? 'border-green-300 bg-green-50/30' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{area.icon}</span>
                      <h3 className="text-xl font-bold text-slate-800">{area.label}</h3>
                      {isComplete && (
                        <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                    
                    {/* Goals Section */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                        🎯 What do you want to achieve? <span className="text-slate-400 font-normal">(select 1-3)</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        {goals.slice(0, 6).map((goal) => (
                          <button
                            key={goal.id}
                            onClick={() => toggleGoal(focusId, goal.id)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-2 ${
                              selectedGoals.includes(goal.id)
                                ? `bg-gradient-to-r ${area.color} text-white shadow-md`
                                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <span className="text-lg">{goal.icon}</span>
                            <span className={`text-sm font-medium ${selectedGoals.includes(goal.id) ? 'text-white' : 'text-slate-700'}`}>
                              {goal.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom goal input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customGoalInputs[focusId] || ''}
                          onChange={(e) => setCustomGoalInputs({ ...customGoalInputs, [focusId]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomGoal(focusId)}
                          placeholder="Or type your own goal..."
                          className="flex-1 px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:border-violet-500 text-sm"
                        />
                        <button
                          onClick={() => addCustomGoal(focusId)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 text-sm"
                        >
                          + Add
                        </button>
                      </div>
                      
                      {customGoals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {customGoals.map((g, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                              {g}
                              <button onClick={() => removeCustomGoal(focusId, idx)} className="hover:text-red-500 ml-1">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Obstacle Section */}
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                        🚧 What&apos;s your main obstacle? <span className="text-slate-400 font-normal">(pick one)</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {improvements.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setChallenge(focusId, item.id)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                              data.challenges[focusId] === item.id
                                ? 'bg-amber-100 border-2 border-amber-400 text-amber-800'
                                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className={`text-sm font-medium ${data.challenges[focusId] === item.id ? 'text-amber-800' : 'text-slate-700'}`}>
                              {item.label}
                            </span>
                            {data.challenges[focusId] === item.id && <span className="ml-auto text-amber-600">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress summary */}
            <div className="mt-6 p-4 bg-violet-50 rounded-xl text-center">
              <p className="text-violet-700 font-medium">
                {getTotalGoals()} goal{getTotalGoals() !== 1 ? 's' : ''} • {Object.keys(data.challenges).length} obstacle{Object.keys(data.challenges).length !== 1 ? 's' : ''} identified
              </p>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep('focus_areas')} className="px-6 py-3 text-slate-500 hover:text-slate-800">
                ← Back
              </button>
              <button
                onClick={() => setStep('commitment')}
                disabled={getTotalGoals() === 0 || Object.keys(data.challenges).length < data.focusAreas.length}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        );

      case 'commitment':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                How much time can you commit?
              </h2>
              <p className="text-slate-600">Be honest — consistency beats intensity</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-4">Hours per day:</label>
                <div className="flex gap-3">
                  {[0.5, 1, 2, 3, 4].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setData({ ...data, hoursPerDay: hours })}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                        data.hoursPerDay === hours
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-4">Days per week:</label>
                <div className="flex gap-3">
                  {[3, 4, 5, 6, 7].map((days) => (
                    <button
                      key={days}
                      onClick={() => setData({ ...data, daysPerWeek: days })}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                        data.daysPerWeek === days
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {days}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-4">Plan duration:</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { days: 30, label: '30 days' },
                    { days: 60, label: '60 days' },
                    { days: 90, label: '90 days' },
                    { days: 180, label: '6 months' },
                  ].map((option) => (
                    <button
                      key={option.days}
                      onClick={() => setData({ ...data, planDuration: option.days })}
                      className={`py-4 rounded-xl font-bold transition-all ${
                        data.planDuration === option.days
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-violet-50 rounded-xl text-center">
                <p className="text-violet-700 font-semibold text-lg">
                  {data.hoursPerDay * data.daysPerWeek} hours/week for {data.planDuration} days
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep('goals_obstacles')} className="px-6 py-3 text-slate-500 hover:text-slate-800">
                ← Back
              </button>
              <button
                onClick={() => setStep('schedule')}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl"
              >
                Next →
              </button>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Tell me about your schedule
              </h2>
              <p className="text-slate-600">So we can plan around your life</p>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-2">⏰ Wake up</label>
                  <input
                    type="time"
                    value={data.wakeUpTime}
                    onChange={(e) => setData({ ...data, wakeUpTime: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-xl focus:border-violet-500 text-lg"
                  />
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-2">😴 Sleep</label>
                  <input
                    type="time"
                    value={data.sleepTime}
                    onChange={(e) => setData({ ...data, sleepTime: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-xl focus:border-violet-500 text-lg"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-3">Work schedule:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: '9-5', label: '9 to 5' },
                    { id: 'flexible', label: 'Flexible' },
                    { id: 'remote', label: 'Remote' },
                    { id: 'shifts', label: 'Shifts' },
                    { id: 'student', label: 'Student' },
                    { id: 'freelance', label: 'Freelance' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setData({ ...data, workSchedule: option.id })}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        data.workSchedule === option.id
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-2">Age</label>
                  <input
                    type="number"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
                    min={16}
                    max={100}
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-xl focus:border-violet-500 text-lg"
                  />
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-2">Monthly budget (₹)</label>
                  <input
                    type="number"
                    value={data.monthlyBudget}
                    onChange={(e) => setData({ ...data, monthlyBudget: Number(e.target.value) })}
                    step={5000}
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-xl focus:border-violet-500 text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep('commitment')} className="px-6 py-3 text-slate-500 hover:text-slate-800">
                ← Back
              </button>
              <button
                onClick={() => setStep('preview')}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl"
              >
                Next →
              </button>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Here&apos;s What We&apos;ll Build For You
              </h2>
              <p className="text-slate-600">Based on your inputs, your personalized plan will include:</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
                <div>
                  <h3 className="font-bold text-slate-800">Daily Habits</h3>
                  <p className="text-slate-600 text-sm">3-5 personalized habits tailored to your goals</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">🌅</div>
                <div>
                  <h3 className="font-bold text-slate-800">Morning & Evening Routines</h3>
                  <p className="text-slate-600 text-sm">Optimized for your wake time ({data.wakeUpTime}) and sleep ({data.sleepTime})</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🎯</div>
                <div>
                  <h3 className="font-bold text-slate-800">Weekly Goals</h3>
                  <p className="text-slate-600 text-sm">Achievable milestones to keep you motivated</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <h3 className="font-bold text-slate-800">{data.planDuration}-Day Milestones</h3>
                  <p className="text-slate-600 text-sm">Progress checkpoints at Week 1, 4, and {Math.floor(data.planDuration / 7)}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl">💡</div>
                <div>
                  <h3 className="font-bold text-slate-800">AI Coaching Tips</h3>
                  <p className="text-slate-600 text-sm">Personalized advice based on your obstacles</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl text-center mb-8">
              <p className="text-violet-700 font-medium">
                📊 {data.hoursPerDay}h/day • {data.daysPerWeek} days/week • {data.planDuration} days
              </p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('schedule')} className="px-6 py-3 text-slate-500 hover:text-slate-800">
                ← Back
              </button>
              <button
                onClick={() => {
                  // Auto-select smart defaults for tracking
                  const smartDefaults = getSmartDefaultTracking();
                  if (data.trackingAreas.length === 0) {
                    setData({ ...data, trackingAreas: smartDefaults });
                  }
                  setStep('tracking');
                }}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl"
              >
                Customize Tracking →
              </button>
            </div>
          </div>
        );

      case 'tracking':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Customize Your Tracking
              </h2>
              <p className="text-slate-600">We&apos;ve selected recommended metrics. Adjust as needed.</p>
              {data.trackingAreas.length > 0 && (
                <p className="text-sm text-green-600 mt-2">✓ {data.trackingAreas.length} metrics selected</p>
              )}
            </div>
            
            <div className="space-y-6">
              {data.focusAreas.map((focusId) => {
                const area = focusAreaOptions.find(a => a.id === focusId)!;
                const tracking = trackingByFocus[focusId] || [];

                return (
                  <div key={focusId} className="bg-white rounded-2xl p-5 border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{area.icon}</span>
                      <h3 className="font-bold text-slate-800">{area.label} Metrics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tracking.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => toggleTracking(track.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            data.trackingAreas.includes(track.id)
                              ? `bg-gradient-to-r ${area.color} text-white shadow-md`
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{track.icon}</span>
                          <span>{track.label}</span>
                          {data.trackingAreas.includes(track.id) && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Custom tracking */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-3">Track something else?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTrackingInput}
                    onChange={(e) => setCustomTrackingInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTracking()}
                    placeholder="E.g., Caffeine, Gratitude..."
                    className="flex-1 px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl"
                  />
                  <button onClick={addCustomTracking} className="px-4 py-3 bg-violet-100 text-violet-700 font-semibold rounded-xl hover:bg-violet-200">
                    Add
                  </button>
                </div>
                {data.customTracking.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.customTracking.map((t, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                        {t}
                        <button onClick={() => setData({ ...data, customTracking: data.customTracking.filter((_, i) => i !== idx) })} className="hover:text-red-500 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep('preview')} className="px-6 py-3 text-slate-500 hover:text-slate-800">
                ← Back
              </button>
              <button
                onClick={handleGeneratePlan}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl"
              >
                Generate My Plan ✨
              </button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center py-12">
            <div className="text-7xl mb-6 animate-bounce">🤖</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Creating Your Plan...</h2>
            <p className="text-slate-600">Analyzing your {data.focusAreas.length} focus area(s) and {getTotalGoals()} goal(s)</p>
          </div>
        );

      case 'review':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Your Plan is Ready{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-lg text-violet-600 font-medium mt-3">
                You&apos;ve just taken a powerful step toward becoming the best version of yourself.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
                ❌ {error}
              </div>
            )}

            {generatedPlan && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800">{generatedPlan.planName}</h3>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                    {generatedPlan.duration} days
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">📋 Daily Habits</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedPlan.dailyHabits?.slice(0, 6).map((habit: any, idx: number) => (
                        <span key={idx} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm flex items-center gap-2">
                          <span>{habit.icon}</span>
                          <span>{habit.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">🎯 Weekly Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedPlan.weeklyGoals?.map((goal: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl">
                    <p className="text-violet-800 text-sm">
                      <span className="font-bold">💡 Coach:</span> {generatedPlan.coachingTip}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Emotional encouragement */}
            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center">
              <p className="text-green-700 font-medium">
                💪 {data.planDuration} days from now, you&apos;ll look back and thank yourself for starting today.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={savePlanAndContinue}
                disabled={saving}
                className="w-full px-6 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-violet-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-lg shadow-violet-200"
              >
                {saving ? '💾 Saving...' : '🚀 Start Day 1'}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/onboarding/edit-plan')}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition text-sm"
                >
                  ✏️ Edit Plan
                </button>
                <button
                  onClick={() => {
                    // Simple browser notification permission request
                    if ('Notification' in window) {
                      Notification.requestPermission();
                    }
                    alert('Daily reminders enabled! We\'ll notify you at your wake time.');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition text-sm"
                >
                  🔔 Set Reminder
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {step !== 'welcome' && step !== 'generating' && step !== 'review' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          {/* Progress bar */}
          <div className="h-1 bg-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step counter and time estimate */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-2">
            <div className="max-w-5xl mx-auto flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">
                Step {currentIndex} of {steps.length - 2}
              </span>
              <span className="text-violet-600 font-medium">
                {getTimeEstimate()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-5xl mx-auto px-4 ${step !== 'welcome' && step !== 'generating' && step !== 'review' ? 'pt-20 pb-12' : 'py-12'}`}>
        {renderStep()}
      </div>
    </div>
  );
}
