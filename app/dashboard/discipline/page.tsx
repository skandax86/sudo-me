'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, FeatureSection, EmptyDomainState, ComingSoon } from '@/components/dashboard/DomainDashboard';
import { BaseWidget, MetricWidget, ListWidget } from '@/components/dashboard/widgets/BaseWidget';
import { DailyLog, GeneratedPlan } from '@/types/database';

const domainConfig = getDomainConfig('discipline');

interface DisciplineData {
  todayLog: DailyLog | null;
  weekLogs: DailyLog[];
  plan: GeneratedPlan | null;
  streak: number;
}

export default function DisciplineDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DisciplineData | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseReady()) {
        router.push('/setup');
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Fetch profile for plan and streak
        const { data: profile } = await supabase
          .from('profiles')
          .select('generated_plan, current_streak')
          .eq('id', user.id)
          .single();

        // Fetch today's log
        const today = new Date().toISOString().split('T')[0];
        const { data: todayLog } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .single();

        // Fetch week's logs
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: weekLogs } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', weekAgo.toISOString().split('T')[0])
          .order('log_date', { ascending: false });

        setData({
          todayLog,
          weekLogs: weekLogs || [],
          plan: profile?.generated_plan || null,
          streak: profile?.current_streak || 0,
        });
      } catch (error) {
        console.error('Error fetching discipline data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-40 bg-slate-200 rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <DomainDashboard config={domainConfig}>
        <EmptyDomainState
          config={domainConfig}
          actionLabel="Start Tracking Habits"
          actionHref="/dashboard/log"
        />
      </DomainDashboard>
    );
  }

  const { todayLog, weekLogs, plan, streak } = data;

  // Calculate habit completion
  const habits = [
    { id: 'wake', label: 'Wake up at 6 AM', icon: '⏰', done: todayLog?.woke_up_at_6am || false },
    { id: 'shower', label: 'Cold shower', icon: '🚿', done: todayLog?.cold_shower || false },
    { id: 'phone', label: 'No phone first hour', icon: '📵', done: todayLog?.no_phone_first_hour || false },
    { id: 'meditate', label: 'Meditated', icon: '🧘', done: todayLog?.meditated || false },
    { id: 'plan', label: 'Planned tomorrow', icon: '📋', done: todayLog?.planned_tomorrow || false },
  ];

  const completedToday = habits.filter(h => h.done).length;
  const avgScore = weekLogs.length > 0
    ? Math.round(weekLogs.reduce((sum, log) => sum + (log.discipline_score || 0), 0) / weekLogs.length)
    : 0;

  // Get custom habits from plan
  const planHabits = plan?.dailyHabits || [];

  return (
    <DomainDashboard
      config={domainConfig}
      streak={streak}
      todayProgress={{ current: completedToday, total: 5 }}
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricWidget
          title="Today's Score"
          value={`${todayLog?.discipline_score || 0}%`}
          icon="🎯"
          subtitle={todayLog ? 'Logged' : 'Not logged'}
          color={todayLog?.discipline_score && todayLog.discipline_score >= 80 ? 'success' : 'default'}
        />
        <MetricWidget
          title="Week Average"
          value={`${avgScore}%`}
          icon="📊"
          subtitle="Last 7 days"
        />
        <MetricWidget
          title="Streak"
          value={streak}
          icon="🔥"
          subtitle="Days in a row"
          color={streak >= 7 ? 'success' : 'default'}
        />
        <MetricWidget
          title="Habits Done"
          value={`${completedToday}/5`}
          icon="✅"
          subtitle="Today"
        />
      </div>

      {/* Today's Habits */}
      <FeatureSection title="Today's Habits" actionHref="/dashboard/log" actionLabel="Log">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Core Habits */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4">Core Habits</h3>
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    habit.done ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{habit.icon}</span>
                  <span className={`flex-1 ${habit.done ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {habit.label}
                  </span>
                  {habit.done && <span className="text-emerald-500 font-bold">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Habits from Plan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4">Your Plan Habits</h3>
            {planHabits.length > 0 ? (
              <div className="space-y-3">
                {planHabits.slice(0, 5).map((habit: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-purple-50"
                  >
                    <span className="text-xl">{habit.icon || '🎯'}</span>
                    <div className="flex-1">
                      <p className="text-purple-700 font-medium">{habit.name}</p>
                      <p className="text-xs text-purple-500">{habit.target}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <p>No custom habits set</p>
                <Link href="/onboarding/edit-plan" className="text-violet-600 hover:underline text-sm">
                  Edit your plan →
                </Link>
              </div>
            )}
          </div>
        </div>
      </FeatureSection>

      {/* Weekly Progress */}
      <FeatureSection title="Weekly Discipline Score">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-end justify-between gap-2 h-40">
            {weekLogs.length > 0 ? (
              weekLogs.slice(0, 7).reverse().map((log, idx) => {
                const score = log.discipline_score || 0;
                const height = `${(score / 100) * 100}%`;
                const date = new Date(log.log_date);
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });

                return (
                  <div key={log.id} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-32 flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          score >= 80
                            ? 'bg-emerald-500'
                            : score >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-400'
                        }`}
                        style={{ height }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{dayName}</span>
                    <span className="text-sm font-medium text-slate-700">{score}%</span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                No data for this week
              </div>
            )}
          </div>
        </div>
      </FeatureSection>

      {/* Routines */}
      {plan?.morningRoutine && plan.morningRoutine.length > 0 && (
        <FeatureSection title="Morning Routine">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="space-y-3">
              {plan.morningRoutine.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl"
                >
                  <span className="text-xl">{item.icon || '🌅'}</span>
                  <span className="flex-1 text-amber-700">{item.activity}</span>
                  <span className="text-sm text-amber-500">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </FeatureSection>
      )}

      {plan?.eveningRoutine && plan.eveningRoutine.length > 0 && (
        <FeatureSection title="Evening Routine">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="space-y-3">
              {plan.eveningRoutine.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl"
                >
                  <span className="text-xl">{item.icon || '🌙'}</span>
                  <span className="flex-1 text-indigo-700">{item.activity}</span>
                  <span className="text-sm text-indigo-500">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </FeatureSection>
      )}

      {/* AI Accountability Placeholder */}
      <FeatureSection title="AI Accountability Coach">
        <ComingSoon
          feature="AI Accountability Partner"
          description="Get daily motivation, pattern analysis, and personalized tips to build better habits."
        />
      </FeatureSection>
    </DomainDashboard>
  );
}

