'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Calendar,
  Sun,
  Moon,
  Target,
  TrendingUp,
  Clock,
  Sparkles,
  Save,
  Brain
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { AppHeader } from '@/components/layout';

interface Habit {
  name: string;
  target: string;
  icon: string;
  time?: string;
}

interface RoutineItem {
  activity: string;
  duration: string;
  icon: string;
}

interface TrackingItem {
  name: string;
  frequency: string;
  metric?: string;
}

interface Plan {
  duration: number;
  planName: string;
  dailyHabits: Habit[];
  weeklyGoals: string[];
  morningRoutine: RoutineItem[];
  eveningRoutine: RoutineItem[];
  tracking: TrackingItem[];
  milestones: Record<string, string>;
  budgetAllocation: Record<string, number>;
  coachingTip: string;
  wakeTime: string;
  sleepTime: string;
}

type TabId = 'habits' | 'routine' | 'goals' | 'tracking';

const tabs: Array<{ id: TabId; label: string; icon: typeof Calendar }> = [
  { id: 'habits', label: 'Daily Habits', icon: Check },
  { id: 'routine', label: 'Routines', icon: Sun },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'tracking', label: 'Tracking', icon: TrendingUp },
];

export default function EditPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('habits');

  useEffect(() => {
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }

    const loadPlan = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('generated_plan')
          .eq('id', user.id)
          .single();

        if (profile?.generated_plan) {
          setPlan(profile.generated_plan);
        } else {
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error loading plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [router]);

  const savePlan = async () => {
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ generated_plan: plan })
        .eq('id', user.id);

      router.push('/onboarding');
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setSaving(false);
    }
  };

  const addHabit = () => {
    if (!plan) return;
    setPlan({
      ...plan,
      dailyHabits: [...plan.dailyHabits, { name: '', target: 'Daily', icon: '✅', time: '' }],
    });
  };

  const updateHabit = (index: number, field: keyof Habit, value: string) => {
    if (!plan) return;
    const updated = [...plan.dailyHabits];
    updated[index] = { ...updated[index], [field]: value };
    setPlan({ ...plan, dailyHabits: updated });
  };

  const removeHabit = (index: number) => {
    if (!plan) return;
    setPlan({ ...plan, dailyHabits: plan.dailyHabits.filter((_, i) => i !== index) });
  };

  const addRoutineItem = (type: 'morning' | 'evening') => {
    if (!plan) return;
    const key = type === 'morning' ? 'morningRoutine' : 'eveningRoutine';
    setPlan({
      ...plan,
      [key]: [...plan[key], { activity: '', duration: '10 min', icon: '⭐' }],
    });
  };

  const updateRoutineItem = (type: 'morning' | 'evening', index: number, field: keyof RoutineItem, value: string) => {
    if (!plan) return;
    const key = type === 'morning' ? 'morningRoutine' : 'eveningRoutine';
    const updated = [...plan[key]];
    updated[index] = { ...updated[index], [field]: value };
    setPlan({ ...plan, [key]: updated });
  };

  const removeRoutineItem = (type: 'morning' | 'evening', index: number) => {
    if (!plan) return;
    const key = type === 'morning' ? 'morningRoutine' : 'eveningRoutine';
    setPlan({ ...plan, [key]: plan[key].filter((_, i) => i !== index) });
  };

  const addGoal = () => {
    if (!plan) return;
    setPlan({ ...plan, weeklyGoals: [...plan.weeklyGoals, ''] });
  };

  const updateGoal = (index: number, value: string) => {
    if (!plan) return;
    const updated = [...plan.weeklyGoals];
    updated[index] = value;
    setPlan({ ...plan, weeklyGoals: updated });
  };

  const removeGoal = (index: number) => {
    if (!plan) return;
    setPlan({ ...plan, weeklyGoals: plan.weeklyGoals.filter((_, i) => i !== index) });
  };

  const addTracking = () => {
    if (!plan) return;
    setPlan({
      ...plan,
      tracking: [...plan.tracking, { name: '', frequency: 'Daily', metric: '' }],
    });
  };

  const updateTracking = (index: number, field: keyof TrackingItem, value: string) => {
    if (!plan) return;
    const updated = [...plan.tracking];
    updated[index] = { ...updated[index], [field]: value };
    setPlan({ ...plan, tracking: updated });
  };

  const removeTracking = (index: number) => {
    if (!plan) return;
    setPlan({ ...plan, tracking: plan.tracking.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--obsidian-deepest)] flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Sparkles size={48} className="text-[var(--gold-primary)] mx-auto mb-4 animate-pulse" />
          <p className="text-[var(--text-muted)]">Loading your plan...</p>
        </motion.div>
      </div>
    );
  }

  if (!plan) return null;

  const inputClasses = "w-full px-4 py-3 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)] transition-all placeholder-[var(--text-ghost)]";
  const selectClasses = "px-3 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg focus:border-[var(--gold-primary)]";

  return (
    <div className="min-h-screen bg-[var(--obsidian-deepest)]">
      <AppHeader showBack backHref="/onboarding" variant="app" />

      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-[var(--obsidian-deepest)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-[var(--text-primary)]">
              Edit Your Plan
            </h1>
            <p className="text-sm text-[var(--text-ghost)]">Customize everything to fit your needs</p>
          </div>
          <motion.button
            onClick={savePlan}
            disabled={saving}
            className="px-6 py-2.5 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Plan Overview */}
        <motion.div 
          className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Plan Name</label>
              <input
                type="text"
                value={plan.planName}
                onChange={(e) => setPlan({ ...plan, planName: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Duration</label>
              <select
                value={plan.duration}
                onChange={(e) => setPlan({ ...plan, duration: Number(e.target.value) })}
                className={inputClasses}
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
                <option value={180}>180 Days (6 months)</option>
                <option value={365}>365 Days (1 year)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                  <Sun size={14} />
                  Wake
                </label>
                <input
                  type="time"
                  value={plan.wakeTime}
                  onChange={(e) => setPlan({ ...plan, wakeTime: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                  <Moon size={14} />
                  Sleep
                </label>
                <input
                  type="time"
                  value={plan.sleepTime}
                  onChange={(e) => setPlan({ ...plan, sleepTime: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]'
                    : 'bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--gold-primary)]/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TabIcon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Habits Tab */}
          {activeTab === 'habits' && (
            <motion.div 
              key="habits"
              className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Check size={20} className="text-[var(--gold-primary)]" />
                  Daily Habits
                </h3>
                <motion.button
                  onClick={addHabit}
                  className="px-4 py-2 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] font-medium rounded-lg hover:bg-[var(--gold-primary)]/20 flex items-center gap-1"
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  Add Habit
                </motion.button>
              </div>
              <div className="space-y-3">
                {plan.dailyHabits.map((habit, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex gap-3 items-center p-4 bg-[var(--surface-2)] rounded-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <input
                      type="text"
                      value={habit.icon}
                      onChange={(e) => updateHabit(idx, 'icon', e.target.value)}
                      className="w-12 text-center text-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-2"
                      placeholder="📌"
                    />
                    <input
                      type="text"
                      value={habit.name}
                      onChange={(e) => updateHabit(idx, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                      placeholder="Habit name"
                    />
                    <select
                      value={habit.target}
                      onChange={(e) => updateHabit(idx, 'target', e.target.value)}
                      className={selectClasses}
                    >
                      <option value="Daily">Daily</option>
                      <option value="3x/week">3x/week</option>
                      <option value="4x/week">4x/week</option>
                      <option value="5x/week">5x/week</option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Weekends">Weekends</option>
                    </select>
                    <input
                      type="text"
                      value={habit.time || ''}
                      onChange={(e) => updateHabit(idx, 'time', e.target.value)}
                      className="w-24 px-3 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                      placeholder="Time"
                    />
                    <motion.button
                      onClick={() => removeHabit(idx)}
                      className="p-2 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Routine Tab */}
          {activeTab === 'routine' && (
            <motion.div 
              key="routine"
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Morning Routine */}
              <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <Sun size={20} className="text-[var(--status-warning)]" />
                    Morning Routine
                  </h3>
                  <motion.button
                    onClick={() => addRoutineItem('morning')}
                    className="px-4 py-2 bg-[var(--status-warning)]/10 text-[var(--status-warning)] font-medium rounded-lg hover:bg-[var(--status-warning)]/20 flex items-center gap-1"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={16} />
                    Add
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {plan.morningRoutine.map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      className="flex gap-3 items-center p-4 bg-[var(--status-warning)]/5 rounded-xl border border-[var(--status-warning)]/20"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => updateRoutineItem('morning', idx, 'icon', e.target.value)}
                        className="w-12 text-center text-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-2"
                      />
                      <input
                        type="text"
                        value={item.activity}
                        onChange={(e) => updateRoutineItem('morning', idx, 'activity', e.target.value)}
                        className="flex-1 px-4 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                        placeholder="Activity"
                      />
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) => updateRoutineItem('morning', idx, 'duration', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                        placeholder="Duration"
                      />
                      <motion.button
                        onClick={() => removeRoutineItem('morning', idx)}
                        className="p-2 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Evening Routine */}
              <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <Moon size={20} className="text-[var(--status-info)]" />
                    Evening Routine
                  </h3>
                  <motion.button
                    onClick={() => addRoutineItem('evening')}
                    className="px-4 py-2 bg-[var(--status-info)]/10 text-[var(--status-info)] font-medium rounded-lg hover:bg-[var(--status-info)]/20 flex items-center gap-1"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={16} />
                    Add
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {plan.eveningRoutine.map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      className="flex gap-3 items-center p-4 bg-[var(--status-info)]/5 rounded-xl border border-[var(--status-info)]/20"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => updateRoutineItem('evening', idx, 'icon', e.target.value)}
                        className="w-12 text-center text-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-2"
                      />
                      <input
                        type="text"
                        value={item.activity}
                        onChange={(e) => updateRoutineItem('evening', idx, 'activity', e.target.value)}
                        className="flex-1 px-4 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                        placeholder="Activity"
                      />
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) => updateRoutineItem('evening', idx, 'duration', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                        placeholder="Duration"
                      />
                      <motion.button
                        onClick={() => removeRoutineItem('evening', idx)}
                        className="p-2 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <motion.div 
              key="goals"
              className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Target size={20} className="text-[var(--status-success)]" />
                  Weekly Goals
                </h3>
                <motion.button
                  onClick={addGoal}
                  className="px-4 py-2 bg-[var(--status-success)]/10 text-[var(--status-success)] font-medium rounded-lg hover:bg-[var(--status-success)]/20 flex items-center gap-1"
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  Add Goal
                </motion.button>
              </div>
              <div className="space-y-3">
                {plan.weeklyGoals.map((goal, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex gap-3 items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Target size={20} className="text-[var(--status-success)]" />
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => updateGoal(idx, e.target.value)}
                      className="flex-1 px-4 py-3 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl placeholder-[var(--text-ghost)]"
                      placeholder="Enter goal"
                    />
                    <motion.button
                      onClick={() => removeGoal(idx)}
                      className="p-2 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Milestones */}
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
                <h4 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--gold-primary)]" />
                  Milestones
                </h4>
                <div className="space-y-3">
                  {Object.entries(plan.milestones).map(([key, value]) => (
                    <div key={key} className="flex gap-3 items-center">
                      <span className="w-20 text-sm font-medium text-[var(--text-ghost)] capitalize">{key.replace('week', 'Week ')}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setPlan({
                          ...plan,
                          milestones: { ...plan.milestones, [key]: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl placeholder-[var(--text-ghost)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <motion.div 
              key="tracking"
              className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-subtle)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <TrendingUp size={20} className="text-[var(--status-info)]" />
                  What to Track
                </h3>
                <motion.button
                  onClick={addTracking}
                  className="px-4 py-2 bg-[var(--status-info)]/10 text-[var(--status-info)] font-medium rounded-lg hover:bg-[var(--status-info)]/20 flex items-center gap-1"
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  Add Tracking
                </motion.button>
              </div>
              <div className="space-y-3">
                {plan.tracking.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex gap-3 items-center p-4 bg-[var(--surface-2)] rounded-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <TrendingUp size={20} className="text-[var(--status-info)]" />
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateTracking(idx, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                      placeholder="What to track"
                    />
                    <select
                      value={item.frequency}
                      onChange={(e) => updateTracking(idx, 'frequency', e.target.value)}
                      className={selectClasses}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                    <input
                      type="text"
                      value={item.metric || ''}
                      onChange={(e) => updateTracking(idx, 'metric', e.target.value)}
                      className="w-32 px-3 py-2 bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg placeholder-[var(--text-ghost)]"
                      placeholder="Metric"
                    />
                    <motion.button
                      onClick={() => removeTracking(idx)}
                      className="p-2 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Budget Allocation */}
              {plan.budgetAllocation && Object.keys(plan.budgetAllocation).length > 0 && (
                <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
                  <h4 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-[var(--gold-primary)]" />
                    Budget Allocation (%)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(plan.budgetAllocation).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm text-[var(--text-ghost)] mb-1 capitalize">{key}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setPlan({
                            ...plan,
                            budgetAllocation: { ...plan.budgetAllocation, [key]: Number(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg text-center"
                          min={0}
                          max={100}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coaching Tip */}
        <motion.div 
          className="bg-gradient-to-r from-[var(--gold-primary)]/20 to-[var(--gold-primary)]/10 rounded-2xl p-6 mt-6 border border-[var(--gold-primary)]/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-medium text-[var(--gold-primary)] mb-3 flex items-center gap-2">
            <Brain size={18} />
            Coaching Tip
          </h4>
          <textarea
            value={plan.coachingTip}
            onChange={(e) => setPlan({ ...plan, coachingTip: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--obsidian-deepest)]/50 text-[var(--text-primary)] border border-[var(--gold-primary)]/30 rounded-xl placeholder-[var(--text-ghost)] focus:border-[var(--gold-primary)]"
            rows={2}
          />
        </motion.div>
      </div>
    </div>
  );
}
