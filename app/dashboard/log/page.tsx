'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { calculateDisciplineScore } from '@/lib/calculations';

export default function DailyLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Habits
  const [wokeUp6am, setWokeUp6am] = useState(false);
  const [coldShower, setColdShower] = useState(false);
  const [noPhoneFirstHour, setNoPhoneFirstHour] = useState(false);
  const [meditated, setMeditated] = useState(false);
  const [plannedTomorrow, setPlannedTomorrow] = useState(false);

  // Fitness
  const [workoutType, setWorkoutType] = useState<string>('Rest');
  const [waterIntake, setWaterIntake] = useState(0);
  const [sleepHours, setSleepHours] = useState(7);

  // Learning
  const [leetcodeSolved, setLeetcodeSolved] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [studyHours, setStudyHours] = useState(0);

  // Journal
  const [impulseRating, setImpulseRating] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }

    const loadTodayLog = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const { data: log } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .single();

        if (log) {
          setWokeUp6am(log.woke_up_at_6am);
          setColdShower(log.cold_shower);
          setNoPhoneFirstHour(log.no_phone_first_hour);
          setMeditated(log.meditated);
          setPlannedTomorrow(log.planned_tomorrow);
          setWorkoutType(log.workout_type || 'Rest');
          setWaterIntake(log.water_intake_oz || 0);
          setSleepHours(log.sleep_hours || 7);
          setLeetcodeSolved(log.leetcode_solved || 0);
          setPagesRead(log.pages_read || 0);
          setStudyHours(log.study_hours || 0);
          setImpulseRating(log.impulse_control_rating || 3);
          setNotes(log.notes || '');
        }
      } catch (error) {
        console.error('Error loading log:', error);
      }
    };

    loadTodayLog();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      const disciplineScore = calculateDisciplineScore({
        wokeUp6am,
        coldShower,
        noPhoneFirstHour,
        meditated,
        plannedTomorrow,
      });

      const logData = {
        user_id: user.id,
        log_date: today,
        woke_up_at_6am: wokeUp6am,
        cold_shower: coldShower,
        no_phone_first_hour: noPhoneFirstHour,
        meditated: meditated,
        planned_tomorrow: plannedTomorrow,
        workout_type: workoutType,
        water_intake_oz: waterIntake,
        sleep_hours: sleepHours,
        leetcode_solved: leetcodeSolved,
        pages_read: pagesRead,
        study_hours: studyHours,
        impulse_control_rating: impulseRating,
        notes: notes,
        discipline_score: disciplineScore,
      };

      const { error: upsertError } = await supabase
        .from('daily_logs')
        .upsert(logData, { onConflict: 'user_id,log_date' });

      if (upsertError) throw upsertError;

      if (wokeUp6am && coldShower && noPhoneFirstHour && meditated && plannedTomorrow) {
        await supabase
          .from('profiles')
          .update({ 
            current_streak: supabase.rpc('increment_streak', { user_id: user.id }) 
          })
          .eq('id', user.id);
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white text-gray-900 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder-slate-400 font-medium";
  const selectClasses = "w-full px-4 py-3 bg-white text-gray-900 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium appearance-none cursor-pointer";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Daily Log
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 font-medium">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl mb-6 font-medium">
            ✅ Log saved successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habits Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">🌅</span>
              <h2 className="text-xl font-bold text-slate-800">Morning Habits</h2>
            </div>
            <div className="space-y-3">
              {[
                { state: wokeUp6am, setter: setWokeUp6am, label: 'Woke up at 6 AM', icon: '⏰' },
                { state: coldShower, setter: setColdShower, label: 'Cold shower', icon: '🚿' },
                { state: noPhoneFirstHour, setter: setNoPhoneFirstHour, label: 'No phone first hour', icon: '📵' },
                { state: meditated, setter: setMeditated, label: 'Meditated (10+ mins)', icon: '🧘' },
                { state: plannedTomorrow, setter: setPlannedTomorrow, label: 'Planned tomorrow', icon: '📋' },
              ].map((habit, idx) => (
                <label 
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                    habit.state 
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300' 
                      : 'bg-slate-50 border-2 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={habit.state}
                    onChange={(e) => habit.setter(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-2 border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="text-xl">{habit.icon}</span>
                  <span className={`font-medium ${habit.state ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {habit.label}
                  </span>
                  {habit.state && <span className="ml-auto text-emerald-500 font-bold">✓</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Fitness Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">💪</span>
              <h2 className="text-xl font-bold text-slate-800">Fitness</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Workout Type</label>
                <div className="relative">
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="Gym">🏋️ Gym</option>
                    <option value="Run">🏃 Run</option>
                    <option value="Calisthenics">🤸 Calisthenics</option>
                    <option value="Swim">🏊 Swim</option>
                    <option value="Rest">😴 Rest Day</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
              
              <div>
                <label className={labelClasses}>
                  Water Intake (oz) 
                  <span className="text-violet-500 ml-2">Target: 128</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(Number(e.target.value))}
                    min="0"
                    max="200"
                    className={inputClasses}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">💧</span>
                </div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                    style={{ width: `${Math.min((waterIntake / 128) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>
                  Sleep Hours
                  <span className="text-violet-500 ml-2">Target: 7-8</span>
                </label>
                <input
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  min="0"
                  max="12"
                  step="0.5"
                  className={inputClasses}
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          {/* Learning Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl font-bold text-slate-800">Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>LeetCode 💻</label>
                <input
                  type="number"
                  value={leetcodeSolved}
                  onChange={(e) => setLeetcodeSolved(Number(e.target.value))}
                  min="0"
                  className={inputClasses}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClasses}>Pages Read 📖</label>
                <input
                  type="number"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(Number(e.target.value))}
                  min="0"
                  className={inputClasses}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClasses}>Study Hours ⏱️</label>
                <input
                  type="number"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  min="0"
                  step="0.5"
                  className={inputClasses}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Journal Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">📝</span>
              <h2 className="text-xl font-bold text-slate-800">Journal</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Impulse Control Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setImpulseRating(rating)}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                        impulseRating === rating
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-200 scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div>
                <label className={labelClasses}>Notes / Reflection</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className={`${inputClasses} resize-none`}
                  placeholder="How was your day? Any challenges or wins? What did you learn?"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300"
          >
            {loading ? '💾 Saving...' : '✨ Save Today\'s Log'}
          </button>
        </form>
      </div>
    </div>
  );
}
