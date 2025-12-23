'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Brain, 
  Heart, 
  Wallet, 
  BookOpen, 
  Sparkles,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
  Zap,
  Moon,
  Sun,
  Briefcase,
  TrendingUp,
  Dumbbell,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { AppHeader } from '@/components/layout';

type Step = 
  | 'welcome' 
  | 'focus_areas' 
  | 'goals_obstacles'
  | 'commitment'
  | 'schedule'
  | 'preview'
  | 'tracking'
  | 'generating' 
  | 'review';

interface FocusArea {
  id: string;
  label: string;
  icon: typeof Target;
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

// Focus area definitions with Lucide icons
const focusAreaOptions: FocusArea[] = [
  { id: 'health', label: 'Health & Fitness', icon: Dumbbell, desc: 'Get fit, lose weight, build strength', color: 'var(--status-success)' },
  { id: 'career', label: 'Career & Work', icon: Briefcase, desc: 'Grow professionally, get promoted', color: 'var(--status-info)' },
  { id: 'finance', label: 'Money & Wealth', icon: Wallet, desc: 'Save, invest, build wealth', color: 'var(--gold-primary)' },
  { id: 'discipline', label: 'Discipline & Habits', icon: Target, desc: 'Build routines, self-control', color: 'var(--status-error)' },
  { id: 'learning', label: 'Learning & Skills', icon: BookOpen, desc: 'Learn new things, upskill', color: 'var(--status-info)' },
  { id: 'personal', label: 'Personal Growth', icon: Heart, desc: 'Confidence, relationships', color: 'var(--status-error)' },
];

// Goals organized by focus area
const goalsByFocus: Record<string, Array<{ id: string; label: string; icon: typeof Target }>> = {
  health: [
    { id: 'lose_weight', label: 'Lose weight', icon: Zap },
    { id: 'build_muscle', label: 'Build muscle', icon: Dumbbell },
    { id: 'improve_stamina', label: 'Improve stamina', icon: TrendingUp },
    { id: 'eat_healthier', label: 'Eat healthier', icon: Heart },
    { id: 'better_sleep', label: 'Sleep better', icon: Moon },
    { id: 'more_energy', label: 'Have more energy', icon: Zap },
  ],
  career: [
    { id: 'get_promoted', label: 'Get promoted', icon: TrendingUp },
    { id: 'new_job', label: 'Find new job', icon: Briefcase },
    { id: 'learn_skills', label: 'Learn new skills', icon: Brain },
    { id: 'build_network', label: 'Build network', icon: Heart },
    { id: 'start_business', label: 'Start a business', icon: Rocket },
    { id: 'get_certified', label: 'Get certified', icon: Check },
  ],
  finance: [
    { id: 'save_money', label: 'Save more money', icon: Wallet },
    { id: 'pay_debt', label: 'Pay off debt', icon: Target },
    { id: 'start_investing', label: 'Start investing', icon: TrendingUp },
    { id: 'emergency_fund', label: 'Emergency fund', icon: AlertCircle },
    { id: 'budget_better', label: 'Budget better', icon: Calendar },
    { id: 'increase_income', label: 'Increase income', icon: Zap },
  ],
  discipline: [
    { id: 'wake_early', label: 'Wake up early', icon: Sun },
    { id: 'build_routine', label: 'Build routine', icon: Calendar },
    { id: 'reduce_phone', label: 'Less phone time', icon: AlertCircle },
    { id: 'meditate', label: 'Meditate daily', icon: Brain },
    { id: 'read_more', label: 'Read more books', icon: BookOpen },
    { id: 'journal', label: 'Journal regularly', icon: BookOpen },
  ],
  learning: [
    { id: 'learn_coding', label: 'Learn coding', icon: Brain },
    { id: 'learn_language', label: 'Learn language', icon: BookOpen },
    { id: 'online_courses', label: 'Complete courses', icon: Check },
    { id: 'read_books', label: 'Read 12+ books', icon: BookOpen },
    { id: 'creative_skill', label: 'Creative skill', icon: Sparkles },
    { id: 'public_speaking', label: 'Public speaking', icon: Target },
  ],
  personal: [
    { id: 'more_confident', label: 'Be more confident', icon: Zap },
    { id: 'better_relationships', label: 'Better relationships', icon: Heart },
    { id: 'be_social', label: 'Be more social', icon: Heart },
    { id: 'travel_more', label: 'Travel more', icon: Rocket },
    { id: 'find_purpose', label: 'Find purpose', icon: Target },
    { id: 'mental_health', label: 'Mental health', icon: Brain },
  ],
};

// Improvements/obstacles by focus area
const improvementsByFocus: Record<string, Array<{ id: string; label: string; icon: typeof Target }>> = {
  health: [
    { id: 'find_time', label: 'Make time for fitness', icon: Clock },
    { id: 'stay_motivated', label: 'Stay motivated daily', icon: Zap },
    { id: 'learn_workouts', label: 'Learn proper workouts', icon: BookOpen },
    { id: 'build_consistency', label: 'Build consistency', icon: Calendar },
    { id: 'eat_better', label: 'Eat healthier meals', icon: Heart },
  ],
  career: [
    { id: 'find_direction', label: 'Find my career path', icon: Target },
    { id: 'break_through', label: 'Break through barriers', icon: Rocket },
    { id: 'gain_skills', label: 'Gain new skills', icon: Brain },
    { id: 'build_confidence', label: 'Build confidence', icon: Zap },
    { id: 'grow_network', label: 'Grow my network', icon: Heart },
  ],
  finance: [
    { id: 'start_saving', label: 'Start saving regularly', icon: Wallet },
    { id: 'control_spending', label: 'Control my spending', icon: AlertCircle },
    { id: 'become_debt_free', label: 'Become debt-free', icon: Target },
    { id: 'learn_investing', label: 'Learn to invest', icon: TrendingUp },
    { id: 'budget_better', label: 'Budget smarter', icon: Calendar },
  ],
  discipline: [
    { id: 'beat_procrastination', label: 'Beat procrastination', icon: Zap },
    { id: 'digital_detox', label: 'Digital detox', icon: AlertCircle },
    { id: 'create_routine', label: 'Create a routine', icon: Calendar },
    { id: 'master_self_control', label: 'Master self-control', icon: Target },
    { id: 'stay_focused', label: 'Stay focused', icon: Target },
  ],
  learning: [
    { id: 'make_time', label: 'Make time to learn', icon: Clock },
    { id: 'focus_path', label: 'Focus on one path', icon: Target },
    { id: 'retain_knowledge', label: 'Retain what I learn', icon: Brain },
    { id: 'stay_curious', label: 'Stay curious & engaged', icon: Sparkles },
    { id: 'practice_daily', label: 'Practice daily', icon: Calendar },
  ],
  personal: [
    { id: 'boost_confidence', label: 'Boost my confidence', icon: Zap },
    { id: 'manage_stress', label: 'Manage stress better', icon: Brain },
    { id: 'connect_people', label: 'Connect with people', icon: Heart },
    { id: 'believe_myself', label: 'Believe in myself', icon: Sparkles },
    { id: 'find_balance', label: 'Find life balance', icon: Target },
  ],
};

// Tracking options by focus area
const trackingByFocus: Record<string, Array<{ id: string; label: string; icon: typeof Target }>> = {
  health: [
    { id: 'weight', label: 'Weight', icon: TrendingUp },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'calories', label: 'Calories', icon: Heart },
    { id: 'water', label: 'Water', icon: Coffee },
    { id: 'sleep', label: 'Sleep', icon: Moon },
  ],
  career: [
    { id: 'tasks', label: 'Tasks', icon: Check },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'networking', label: 'Networking', icon: Heart },
    { id: 'projects', label: 'Projects', icon: Briefcase },
  ],
  finance: [
    { id: 'spending', label: 'Spending', icon: Wallet },
    { id: 'savings', label: 'Savings', icon: Wallet },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: Calendar },
  ],
  discipline: [
    { id: 'habits', label: 'Habits', icon: Check },
    { id: 'wake_time', label: 'Wake Time', icon: Sun },
    { id: 'screen_time', label: 'Screen Time', icon: AlertCircle },
    { id: 'meditation', label: 'Meditation', icon: Brain },
  ],
  learning: [
    { id: 'study_hours', label: 'Study Hours', icon: Clock },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Target },
  ],
  personal: [
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'gratitude', label: 'Gratitude', icon: Sparkles },
    { id: 'social', label: 'Social', icon: Heart },
    { id: 'journal', label: 'Journal', icon: BookOpen },
  ],
};

// Reusable card component
function ZenCard({ children, className = '', selected = false, onClick }: { 
  children: React.ReactNode; 
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={`
        p-5 rounded-2xl border transition-all cursor-pointer
        ${selected 
          ? 'bg-[var(--gold-primary)]/10 border-[var(--gold-primary)]' 
          : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
        }
        ${className}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const [customGoalInputs, setCustomGoalInputs] = useState<Record<string, string>>({});
  const [customTrackingInput, setCustomTrackingInput] = useState('');
  
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
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }

    const loadUser = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (profile?.name) {
          setUserName(profile.name);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
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
    setStep('generating');
    
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userName }),
      });

      const result = await response.json();
      const plan = result.plan || generateFallbackPlan();
      setGeneratedPlan(plan);
      setStep('review');
    } catch (err) {
      console.error('Error generating plan:', err);
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
          habits.push({ name: goal.label, icon: '🎯', target: 'Daily' });
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
    setSaving(true);
    setError('');
    
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const updateData: Record<string, any> = {
        wake_time: data.wakeUpTime,
        start_date: new Date().toISOString().split('T')[0],
        onboarding_complete: true,
        preferences: data,
        generated_plan: generatedPlan,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        // Fallback to minimal update
        await supabase
          .from('profiles')
          .update({
            wake_time: data.wakeUpTime,
            start_date: new Date().toISOString().split('T')[0],
            onboarding_complete: true,
          })
          .eq('id', user.id);
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error saving plan:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getSmartDefaultTracking = () => {
    const defaults: string[] = [];
    if (data.focusAreas.includes('health')) defaults.push('workouts', 'water', 'sleep');
    if (data.focusAreas.includes('finance')) defaults.push('spending', 'savings');
    if (data.focusAreas.includes('discipline')) defaults.push('habits', 'wake_time');
    if (data.focusAreas.includes('career')) defaults.push('tasks', 'learning');
    if (data.focusAreas.includes('learning')) defaults.push('study_hours', 'books');
    if (data.focusAreas.includes('personal')) defaults.push('mood', 'journal');
    return defaults.slice(0, 5);
  };

  // Progress calculation
  const steps: Step[] = ['welcome', 'focus_areas', 'goals_obstacles', 'commitment', 'schedule', 'preview', 'tracking', 'generating', 'review'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--obsidian-deepest)]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Rocket size={48} className="text-[var(--gold-primary)] mx-auto mb-4 animate-bounce" />
          <p className="text-[var(--text-muted)]">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div 
            className="text-center max-w-lg mx-auto pt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-24 h-24 rounded-3xl bg-[var(--gold-primary)]/10 flex items-center justify-center mx-auto mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Sparkles size={48} className="text-[var(--gold-primary)]" />
            </motion.div>
            
            <h1 className="text-4xl font-light text-[var(--text-primary)] mb-4">
              Welcome{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-xl text-[var(--text-muted)] mb-8">
              Let&apos;s create a personalized plan that fits YOUR life.
            </p>
            <p className="text-[var(--text-ghost)] mb-12">
              Takes about 2 minutes. Worth every second.
            </p>
            
            <motion.button
              onClick={() => setStep('focus_areas')}
              className="px-10 py-4 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] text-lg font-medium rounded-2xl flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Let&apos;s Begin
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        );

      case 'focus_areas':
        return (
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-3">
                What areas do you want to improve?
              </h2>
              <p className="text-[var(--text-ghost)]">Select one or more — we&apos;ll tailor your plan to each</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreaOptions.map((area, i) => {
                const IconComponent = area.icon;
                const isSelected = data.focusAreas.includes(area.id);
                
                return (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ZenCard 
                      selected={isSelected}
                      onClick={() => toggleFocusArea(area.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${area.color}20` }}
                        >
                          <IconComponent size={24} style={{ color: area.color }} />
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[var(--gold-primary)] flex items-center justify-center">
                            <Check size={14} className="text-[var(--obsidian-deepest)]" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4">
                        {area.label}
                      </h3>
                      <p className="text-sm text-[var(--text-ghost)] mt-1">
                        {area.desc}
                      </p>
                    </ZenCard>
                  </motion.div>
                );
              })}
            </div>

            {data.focusAreas.length > 0 && (
              <motion.div 
                className="mt-8 p-4 rounded-xl bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-[var(--gold-primary)] font-medium">
                  {data.focusAreas.length} area{data.focusAreas.length > 1 ? 's' : ''} selected
                </p>
              </motion.div>
            )}

            <div className="flex justify-between mt-10">
              <motion.button 
                onClick={() => setStep('welcome')} 
                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2"
                whileHover={{ x: -4 }}
              >
                <ChevronLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={() => setStep('goals_obstacles')}
                disabled={data.focusAreas.length === 0}
                className="px-8 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        );

      case 'goals_obstacles':
        return (
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">
                Goals & What&apos;s Holding You Back
              </h2>
              <p className="text-[var(--text-ghost)]">For each area, tell us what you want to achieve and your main obstacle</p>
            </div>
            
            <div className="space-y-6">
              {data.focusAreas.map((focusId) => {
                const area = focusAreaOptions.find(a => a.id === focusId)!;
                const goals = goalsByFocus[focusId] || [];
                const improvements = improvementsByFocus[focusId] || [];
                const selectedGoals = data.goalsByFocus[focusId] || [];
                const customGoals = data.customGoals[focusId] || [];
                const isComplete = (selectedGoals.length + customGoals.length) > 0 && data.challenges[focusId];
                const IconComponent = area.icon;

                return (
                  <motion.div 
                    key={focusId} 
                    className={`rounded-2xl p-6 border ${
                      isComplete 
                        ? 'bg-[var(--status-success)]/5 border-[var(--status-success)]/30' 
                        : 'bg-[var(--surface-card)] border-[var(--border-subtle)]'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${area.color}20` }}
                      >
                        <IconComponent size={20} style={{ color: area.color }} />
                      </div>
                      <h3 className="text-xl font-medium text-[var(--text-primary)]">{area.label}</h3>
                      {isComplete && (
                        <span className="ml-auto px-3 py-1 bg-[var(--status-success)]/10 text-[var(--status-success)] rounded-full text-sm font-medium flex items-center gap-1">
                          <Check size={14} />
                          Complete
                        </span>
                      )}
                    </div>
                    
                    {/* Goals Section */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
                        <Target size={14} />
                        What do you want to achieve? <span className="text-[var(--text-ghost)]">(select 1-3)</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        {goals.map((goal) => {
                          const GoalIcon = goal.icon;
                          const isSelected = selectedGoals.includes(goal.id);
                          return (
                            <motion.button
                              key={goal.id}
                              onClick={() => toggleGoal(focusId, goal.id)}
                              className={`p-3 rounded-xl text-left transition-all flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)] text-[var(--text-primary)]'
                                  : 'bg-[var(--surface-2)] border border-transparent hover:border-[var(--border-medium)] text-[var(--text-muted)]'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <GoalIcon size={16} className={isSelected ? 'text-[var(--gold-primary)]' : ''} />
                              <span className="text-sm font-medium">{goal.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      {/* Custom goal input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customGoalInputs[focusId] || ''}
                          onChange={(e) => setCustomGoalInputs({ ...customGoalInputs, [focusId]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomGoal(focusId)}
                          placeholder="Or type your own goal..."
                          className="flex-1 px-4 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg focus:border-[var(--gold-primary)] text-sm placeholder-[var(--text-ghost)]"
                        />
                        <motion.button
                          onClick={() => addCustomGoal(focusId)}
                          className="px-4 py-2 bg-[var(--surface-2)] text-[var(--text-muted)] font-medium rounded-lg hover:bg-[var(--surface-card)] flex items-center gap-1"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={16} />
                          Add
                        </motion.button>
                      </div>
                      
                      {customGoals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {customGoals.map((g, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] rounded-full text-sm">
                              {g}
                              <button onClick={() => removeCustomGoal(focusId, idx)} className="hover:text-[var(--status-error)] ml-1">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Obstacle Section */}
                    <div className="pt-5 border-t border-[var(--border-subtle)]">
                      <p className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
                        <AlertCircle size={14} />
                        What&apos;s your main obstacle? <span className="text-[var(--text-ghost)]">(pick one)</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {improvements.map((item) => {
                          const ItemIcon = item.icon;
                          const isSelected = data.challenges[focusId] === item.id;
                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => setChallenge(focusId, item.id)}
                              className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-[var(--status-warning)]/10 border border-[var(--status-warning)] text-[var(--text-primary)]'
                                  : 'bg-[var(--surface-2)] border border-transparent hover:border-[var(--border-medium)] text-[var(--text-muted)]'
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <ItemIcon size={16} className={isSelected ? 'text-[var(--status-warning)]' : ''} />
                              <span className="text-sm font-medium">{item.label}</span>
                              {isSelected && <Check size={14} className="ml-auto text-[var(--status-warning)]" />}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress summary */}
            <motion.div 
              className="mt-8 p-4 rounded-xl bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[var(--gold-primary)] font-medium">
                {getTotalGoals()} goal{getTotalGoals() !== 1 ? 's' : ''} • {Object.keys(data.challenges).length} obstacle{Object.keys(data.challenges).length !== 1 ? 's' : ''} identified
              </p>
            </motion.div>

            <div className="flex justify-between mt-10">
              <motion.button 
                onClick={() => setStep('focus_areas')} 
                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2"
                whileHover={{ x: -4 }}
              >
                <ChevronLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={() => setStep('commitment')}
                disabled={getTotalGoals() === 0 || Object.keys(data.challenges).length < data.focusAreas.length}
                className="px-8 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        );

      case 'commitment':
        return (
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">
                How much time can you commit?
              </h2>
              <p className="text-[var(--text-ghost)]">Be honest — consistency beats intensity</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]">
                <label className="font-medium text-[var(--text-muted)] block mb-4 flex items-center gap-2">
                  <Clock size={16} />
                  Hours per day
                </label>
                <div className="flex gap-3">
                  {[0.5, 1, 2, 3, 4].map((hours) => (
                    <motion.button
                      key={hours}
                      onClick={() => setData({ ...data, hoursPerDay: hours })}
                      className={`flex-1 py-4 rounded-xl font-medium text-lg transition-all ${
                        data.hoursPerDay === hours
                          ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-card)]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {hours}h
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]">
                <label className="font-medium text-[var(--text-muted)] block mb-4 flex items-center gap-2">
                  <Calendar size={16} />
                  Days per week
                </label>
                <div className="flex gap-3">
                  {[3, 4, 5, 6, 7].map((days) => (
                    <motion.button
                      key={days}
                      onClick={() => setData({ ...data, daysPerWeek: days })}
                      className={`flex-1 py-4 rounded-xl font-medium text-lg transition-all ${
                        data.daysPerWeek === days
                          ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-card)]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {days}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]">
                <label className="font-medium text-[var(--text-muted)] block mb-4 flex items-center gap-2">
                  <Target size={16} />
                  Plan duration
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { days: 30, label: '30 days' },
                    { days: 60, label: '60 days' },
                    { days: 90, label: '90 days' },
                    { days: 180, label: '6 months' },
                  ].map((option) => (
                    <motion.button
                      key={option.days}
                      onClick={() => setData({ ...data, planDuration: option.days })}
                      className={`py-4 rounded-xl font-medium transition-all ${
                        data.planDuration === option.days
                          ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-card)]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div 
                className="p-4 rounded-xl bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-[var(--gold-primary)] font-medium text-lg">
                  {data.hoursPerDay * data.daysPerWeek} hours/week for {data.planDuration} days
                </p>
              </motion.div>
            </div>

            <div className="flex justify-between mt-10">
              <motion.button 
                onClick={() => setStep('goals_obstacles')} 
                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2"
                whileHover={{ x: -4 }}
              >
                <ChevronLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={() => setStep('schedule')}
                className="px-8 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        );

      case 'schedule':
        return (
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">
                Tell me about your schedule
              </h2>
              <p className="text-[var(--text-ghost)]">So we can plan around your life</p>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                  <label className="font-medium text-[var(--text-muted)] block mb-2 flex items-center gap-2">
                    <Sun size={16} />
                    Wake up
                  </label>
                  <input
                    type="time"
                    value={data.wakeUpTime}
                    onChange={(e) => setData({ ...data, wakeUpTime: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--gold-primary)] text-lg"
                  />
                </div>
                <div className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                  <label className="font-medium text-[var(--text-muted)] block mb-2 flex items-center gap-2">
                    <Moon size={16} />
                    Sleep
                  </label>
                  <input
                    type="time"
                    value={data.sleepTime}
                    onChange={(e) => setData({ ...data, sleepTime: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--gold-primary)] text-lg"
                  />
                </div>
              </div>

              <div className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                <label className="font-medium text-[var(--text-muted)] block mb-3 flex items-center gap-2">
                  <Briefcase size={16} />
                  Work schedule
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: '9-5', label: '9 to 5' },
                    { id: 'flexible', label: 'Flexible' },
                    { id: 'remote', label: 'Remote' },
                    { id: 'shifts', label: 'Shifts' },
                    { id: 'student', label: 'Student' },
                    { id: 'freelance', label: 'Freelance' },
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setData({ ...data, workSchedule: option.id })}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        data.workSchedule === option.id
                          ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-card)]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                  <label className="font-medium text-[var(--text-muted)] block mb-2">Age</label>
                  <input
                    type="number"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
                    min={16}
                    max={100}
                    className="w-full px-4 py-3 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--gold-primary)] text-lg"
                  />
                </div>
                <div className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                  <label className="font-medium text-[var(--text-muted)] block mb-2">Monthly budget (₹)</label>
                  <input
                    type="number"
                    value={data.monthlyBudget}
                    onChange={(e) => setData({ ...data, monthlyBudget: Number(e.target.value) })}
                    step={5000}
                    className="w-full px-4 py-3 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--gold-primary)] text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <motion.button 
                onClick={() => setStep('commitment')} 
                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2"
                whileHover={{ x: -4 }}
              >
                <ChevronLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={() => setStep('preview')}
                className="px-8 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        );

      case 'preview':
        return (
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-10">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-[var(--gold-primary)]/10 flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <Sparkles size={40} className="text-[var(--gold-primary)]" />
              </motion.div>
              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">
                Here&apos;s What We&apos;ll Build For You
              </h2>
              <p className="text-[var(--text-ghost)]">Based on your inputs, your personalized plan will include:</p>
            </div>
            
            <div className="space-y-4 mb-8">
              {[
                { icon: Calendar, title: 'Daily Habits', desc: '3-5 personalized habits tailored to your goals', color: 'var(--gold-primary)' },
                { icon: Sun, title: 'Morning & Evening Routines', desc: `Optimized for your wake time (${data.wakeUpTime}) and sleep (${data.sleepTime})`, color: 'var(--status-warning)' },
                { icon: Target, title: 'Weekly Goals', desc: 'Achievable milestones to keep you motivated', color: 'var(--status-success)' },
                { icon: TrendingUp, title: `${data.planDuration}-Day Milestones`, desc: `Progress checkpoints at Week 1, 4, and ${Math.floor(data.planDuration / 7)}`, color: 'var(--status-info)' },
                { icon: Brain, title: 'AI Coaching Tips', desc: 'Personalized advice based on your obstacles', color: 'var(--status-error)' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-subtle)] flex items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon size={24} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{item.title}</h3>
                    <p className="text-[var(--text-ghost)] text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="p-4 rounded-xl bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[var(--gold-primary)] font-medium">
                {data.hoursPerDay}h/day • {data.daysPerWeek} days/week • {data.planDuration} days
              </p>
            </motion.div>

            <div className="flex justify-between">
              <motion.button 
                onClick={() => setStep('schedule')} 
                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2"
                whileHover={{ x: -4 }}
              >
                <ChevronLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={() => {
                  const smartDefaults = getSmartDefaultTracking();
                  if (data.trackingAreas.length === 0) {
                    setData({ ...data, trackingAreas: smartDefaults });
                  }
                  setStep('tracking');
                }}
                className="px-8 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Customize Tracking
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        );

      case 'tracking':
        return (
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">
                Customize Your Tracking
              </h2>
              <p className="text-[var(--text-ghost)]">We&apos;ve selected recommended metrics. Adjust as needed.</p>
              {data.trackingAreas.length > 0 && (
                <p className="text-sm text-[var(--status-success)] mt-2">{data.trackingAreas.length} metrics selected</p>
              )}
            </div>
            
            <div className="space-y-6">
              {data.focusAreas.map((focusId) => {
                const area = focusAreaOptions.find(a => a.id === focusId)!;
                const tracking = trackingByFocus[focusId] || [];
                const IconComponent = area.icon;

                return (
                  <div key={focusId} className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${area.color}20` }}
                      >
                        <IconComponent size={20} style={{ color: area.color }} />
                      </div>
                      <h3 className="font-medium text-[var(--text-primary)]">{area.label} Metrics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tracking.map((track) => {
                        const TrackIcon = track.icon;
                        const isSelected = data.trackingAreas.includes(track.id);
                        return (
                          <motion.button
                            key={track.id}
                            onClick={() => toggleTracking(track.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                              isSelected
                                ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]'
                                : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-card)]'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <TrackIcon size={14} />
                            {track.label}
                            {isSelected && <Check size={12} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Custom tracking */}
              <div className="bg-[var(--surface-2)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                <p className="text-sm font-medium text-[var(--text-muted)] mb-3">Track something else?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTrackingInput}
                    onChange={(e) => setCustomTrackingInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTracking()}
                    placeholder="E.g., Caffeine, Gratitude..."
                    className="flex-1 px-4 py-3 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl placeholder-[var(--text-ghost)]"
                  />
                  <motion.button 
                    onClick={addCustomTracking} 
                    className="px-4 py-3 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] font-medium rounded-xl hover:bg-[var(--gold-primary)]/20"
                    whileTap={{ scale: 0.95 }}
                  >
                    Add
                  </motion.button>
                </div>
                {data.customTracking.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.customTracking.map((t, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] rounded-full text-sm">
                        {t}
                        <button onClick={() => setData({ ...data, customTracking: data.customTracking.filter((_, i) => i !== idx) })} className="hover:text-[var(--status-error)] ml-1">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <motion.button 
                onClick={() => setStep('preview')} 
                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2"
                whileHover={{ x: -4 }}
              >
                <ChevronLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={handleGeneratePlan}
                className="px-8 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Generate My Plan
                <Sparkles size={18} />
              </motion.button>
            </div>
          </motion.div>
        );

      case 'generating':
        return (
          <div className="text-center py-20">
            <motion.div
              className="w-24 h-24 rounded-3xl bg-[var(--gold-primary)]/10 flex items-center justify-center mx-auto mb-8"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain size={48} className="text-[var(--gold-primary)]" />
            </motion.div>
            <h2 className="text-3xl font-light text-[var(--text-primary)] mb-4">Creating Your Plan...</h2>
            <p className="text-[var(--text-ghost)]">Analyzing your {data.focusAreas.length} focus area(s) and {getTotalGoals()} goal(s)</p>
          </div>
        );

      case 'review':
        return (
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-10">
              <motion.div
                className="w-24 h-24 rounded-3xl bg-[var(--status-success)]/10 flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <Sparkles size={48} className="text-[var(--status-success)]" />
              </motion.div>
              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">
                Your Plan is Ready{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-lg text-[var(--gold-primary)] font-medium mt-3">
                You&apos;ve just taken a powerful step toward becoming the best version of yourself.
              </p>
            </div>

            {error && (
              <motion.div 
                className="mb-6 p-4 bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] rounded-xl flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}

            {generatedPlan && (
              <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)] mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-[var(--text-primary)]">{generatedPlan.planName}</h3>
                  <span className="px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] rounded-full text-sm font-medium">
                    {generatedPlan.duration} days
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[var(--text-muted)] mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      Daily Habits
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedPlan.dailyHabits?.slice(0, 6).map((habit: any, idx: number) => (
                        <span key={idx} className="px-3 py-2 bg-[var(--surface-2)] text-[var(--text-muted)] rounded-lg text-sm flex items-center gap-2">
                          <span>{habit.icon}</span>
                          <span>{habit.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--text-muted)] mb-2 flex items-center gap-2">
                      <Target size={16} />
                      Weekly Goals
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedPlan.weeklyGoals?.map((goal: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] rounded-full text-sm">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 rounded-xl">
                    <p className="text-[var(--gold-primary)] text-sm flex items-center gap-2">
                      <Brain size={16} />
                      <span className="font-medium">Coach:</span> {generatedPlan.coachingTip}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Emotional encouragement */}
            <motion.div 
              className="mb-6 p-5 bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 rounded-2xl text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-[var(--status-success)] font-medium">
                {data.planDuration} days from now, you&apos;ll look back and thank yourself for starting today.
              </p>
            </motion.div>

            <div className="space-y-3">
              <motion.button
                onClick={savePlanAndContinue}
                disabled={saving}
                className="w-full px-6 py-5 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium text-lg rounded-xl hover:bg-[var(--gold-primary)]/90 transition disabled:opacity-50 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Rocket size={20} />
                    Start Day 1
                  </>
                )}
              </motion.button>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => router.push('/onboarding/edit-plan')}
                  className="flex-1 px-4 py-3 bg-[var(--surface-card)] text-[var(--text-muted)] font-medium rounded-xl hover:bg-[var(--surface-2)] transition text-sm flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Plan
                </motion.button>
                <motion.button
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission();
                    }
                    alert('Daily reminders enabled! We\'ll notify you at your wake time.');
                  }}
                  className="flex-1 px-4 py-3 bg-[var(--surface-card)] text-[var(--text-muted)] font-medium rounded-xl hover:bg-[var(--surface-2)] transition text-sm flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  Set Reminder
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--obsidian-deepest)]">
      <AppHeader showBack={step !== 'welcome'} backHref="/onboarding/template" variant="app" />
      
      {step !== 'welcome' && step !== 'generating' && step !== 'review' && (
        <div className="fixed top-16 left-0 right-0 z-40">
          {/* Progress bar */}
          <div className="h-1 bg-[var(--surface-2)]">
            <motion.div 
              className="h-full bg-[var(--gold-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {/* Step counter */}
          <div className="bg-[var(--obsidian-deepest)]/80 backdrop-blur-sm border-b border-[var(--border-subtle)] px-4 py-2">
            <div className="max-w-5xl mx-auto flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)]">
                Step {currentIndex} of {steps.length - 2}
              </span>
              <span className="text-[var(--gold-primary)]">
                ~{Math.ceil((steps.length - 1 - currentIndex) * 0.3)} min left
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-5xl mx-auto px-4 ${step !== 'welcome' && step !== 'generating' && step !== 'review' ? 'pt-32 pb-12' : 'pt-20 pb-12'}`}>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
