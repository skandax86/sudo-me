'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';

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

export default function EditPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<'habits' | 'routine' | 'goals' | 'tracking'>('habits');

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">✏️</div>
          <p className="text-slate-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const inputClasses = "w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder-slate-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Edit Your Plan
            </h1>
            <p className="text-sm text-slate-500">Customize everything to fit your needs</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/onboarding"
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </Link>
            <button
              onClick={savePlan}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Plan Overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Plan Name</label>
              <input
                type="text"
                value={plan.planName}
                onChange={(e) => setPlan({ ...plan, planName: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (days)</label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Wake Time</label>
                <input
                  type="time"
                  value={plan.wakeTime}
                  onChange={(e) => setPlan({ ...plan, wakeTime: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sleep Time</label>
                <input
                  type="time"
                  value={plan.sleepTime}
                  onChange={(e) => setPlan({ ...plan, sleepTime: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'habits', label: 'Daily Habits', icon: '✅' },
            { id: 'routine', label: 'Routines', icon: '🌅' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'tracking', label: 'Tracking', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Daily Habits</h3>
              <button
                onClick={addHabit}
                className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-lg hover:bg-violet-200"
              >
                + Add Habit
              </button>
            </div>
            <div className="space-y-3">
              {plan.dailyHabits.map((habit, idx) => (
                <div key={idx} className="flex gap-3 items-center p-4 bg-slate-50 rounded-xl">
                  <input
                    type="text"
                    value={habit.icon}
                    onChange={(e) => updateHabit(idx, 'icon', e.target.value)}
                    className="w-12 text-center text-2xl bg-white border-2 border-slate-200 rounded-lg p-2"
                    placeholder="📌"
                  />
                  <input
                    type="text"
                    value={habit.name}
                    onChange={(e) => updateHabit(idx, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                    placeholder="Habit name"
                  />
                  <select
                    value={habit.target}
                    onChange={(e) => updateHabit(idx, 'target', e.target.value)}
                    className="px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                  >
                    <option value="Daily">Daily</option>
                    <option value="3x/week">3x/week</option>
                    <option value="4x/week">4x/week</option>
                    <option value="5x/week">5x/week</option>
                    <option value="6x/week">6x/week</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                  </select>
                  <input
                    type="text"
                    value={habit.time || ''}
                    onChange={(e) => updateHabit(idx, 'time', e.target.value)}
                    className="w-28 px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                    placeholder="Time"
                  />
                  <button
                    onClick={() => removeHabit(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Routine Tab */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            {/* Morning Routine */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">🌅 Morning Routine</h3>
                <button
                  onClick={() => addRoutineItem('morning')}
                  className="px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {plan.morningRoutine.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center p-4 bg-orange-50 rounded-xl">
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => updateRoutineItem('morning', idx, 'icon', e.target.value)}
                      className="w-12 text-center text-2xl bg-white border-2 border-slate-200 rounded-lg p-2"
                    />
                    <input
                      type="text"
                      value={item.activity}
                      onChange={(e) => updateRoutineItem('morning', idx, 'activity', e.target.value)}
                      className="flex-1 px-4 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                      placeholder="Activity"
                    />
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => updateRoutineItem('morning', idx, 'duration', e.target.value)}
                      className="w-24 px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                      placeholder="Duration"
                    />
                    <button
                      onClick={() => removeRoutineItem('morning', idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Evening Routine */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">🌙 Evening Routine</h3>
                <button
                  onClick={() => addRoutineItem('evening')}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {plan.eveningRoutine.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center p-4 bg-indigo-50 rounded-xl">
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => updateRoutineItem('evening', idx, 'icon', e.target.value)}
                      className="w-12 text-center text-2xl bg-white border-2 border-slate-200 rounded-lg p-2"
                    />
                    <input
                      type="text"
                      value={item.activity}
                      onChange={(e) => updateRoutineItem('evening', idx, 'activity', e.target.value)}
                      className="flex-1 px-4 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                      placeholder="Activity"
                    />
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => updateRoutineItem('evening', idx, 'duration', e.target.value)}
                      className="w-24 px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                      placeholder="Duration"
                    />
                    <button
                      onClick={() => removeRoutineItem('evening', idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Weekly Goals</h3>
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200"
              >
                + Add Goal
              </button>
            </div>
            <div className="space-y-3">
              {plan.weeklyGoals.map((goal, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <span className="text-xl">🎯</span>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(idx, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl"
                    placeholder="Enter goal"
                  />
                  <button
                    onClick={() => removeGoal(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Milestones</h4>
              <div className="space-y-3">
                {Object.entries(plan.milestones).map(([key, value]) => (
                  <div key={key} className="flex gap-3 items-center">
                    <span className="w-20 text-sm font-medium text-slate-500 capitalize">{key.replace('week', 'Week ')}</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setPlan({
                        ...plan,
                        milestones: { ...plan.milestones, [key]: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">What to Track</h3>
              <button
                onClick={addTracking}
                className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200"
              >
                + Add Tracking
              </button>
            </div>
            <div className="space-y-3">
              {plan.tracking.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-xl">📊</span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateTracking(idx, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                    placeholder="What to track"
                  />
                  <select
                    value={item.frequency}
                    onChange={(e) => updateTracking(idx, 'frequency', e.target.value)}
                    className="px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <input
                    type="text"
                    value={item.metric || ''}
                    onChange={(e) => updateTracking(idx, 'metric', e.target.value)}
                    className="w-32 px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                    placeholder="Metric"
                  />
                  <button
                    onClick={() => removeTracking(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Budget Allocation */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Budget Allocation (%)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(plan.budgetAllocation).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm text-slate-600 mb-1 capitalize">{key}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setPlan({
                        ...plan,
                        budgetAllocation: { ...plan.budgetAllocation, [key]: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg text-center"
                      min={0}
                      max={100}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Coaching Tip */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl p-6 mt-6 text-white">
          <h4 className="font-bold mb-2">💡 Coaching Tip</h4>
          <textarea
            value={plan.coachingTip}
            onChange={(e) => setPlan({ ...plan, coachingTip: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 text-white border-2 border-white/30 rounded-xl placeholder-white/60 focus:bg-white/30"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}




