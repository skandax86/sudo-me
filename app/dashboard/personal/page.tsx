'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, FeatureSection, EmptyDomainState, ComingSoon } from '@/components/dashboard/DomainDashboard';
import { MetricWidget } from '@/components/dashboard/widgets/BaseWidget';
import { DailyLog, Goal } from '@/types/database';

const domainConfig = getDomainConfig('personal');

interface PersonalData {
  personalGoals: Goal[];
  todayLog: DailyLog | null;
  weekLogs: DailyLog[];
}

export default function PersonalDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PersonalData | null>(null);
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

        // Fetch personal goals
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'Personal')
          .order('created_at', { ascending: false });

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
          personalGoals: goals || [],
          todayLog,
          weekLogs: weekLogs || [],
        });
      } catch (error) {
        console.error('Error fetching personal data:', error);
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
          actionLabel="Start Your Journey"
          actionHref="/dashboard/log"
        />
      </DomainDashboard>
    );
  }

  const { personalGoals, todayLog, weekLogs } = data;
  const activeGoals = personalGoals.filter(g => g.status === 'active');

  // Calculate impulse control average
  const impulseRatings = weekLogs
    .map(log => log.impulse_control_rating)
    .filter((r): r is 1 | 2 | 3 | 4 | 5 => r !== null);
  const avgImpulse = impulseRatings.length > 0
    ? (impulseRatings.reduce((a, b) => a + b, 0) / impulseRatings.length).toFixed(1)
    : '-';

  // Count logs with notes (journal entries)
  const journalEntries = weekLogs.filter(log => log.notes && log.notes.length > 0).length;

  return (
    <DomainDashboard config={domainConfig}>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricWidget
          title="Personal Goals"
          value={activeGoals.length}
          icon="🎯"
          subtitle="In progress"
        />
        <MetricWidget
          title="Journal Entries"
          value={journalEntries}
          icon="📔"
          subtitle="This week"
        />
        <MetricWidget
          title="Impulse Control"
          value={avgImpulse}
          icon="🧠"
          subtitle="Avg. rating"
        />
        <MetricWidget
          title="Reflection"
          value={todayLog?.notes ? '✓' : '-'}
          icon="✨"
          subtitle="Today"
        />
      </div>

      {/* Today's Reflection */}
      <FeatureSection title="Today's Reflection" actionHref="/dashboard/log" actionLabel="Log">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          {todayLog?.notes ? (
            <div>
              <p className="text-slate-700 leading-relaxed">{todayLog.notes}</p>
              <p className="text-xs text-slate-400 mt-4">
                Logged on {new Date(todayLog.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-slate-500 mb-4">No reflection logged for today</p>
              <Link
                href="/dashboard/log"
                className="inline-block px-4 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition"
              >
                Add Today&apos;s Reflection
              </Link>
            </div>
          )}
        </div>
      </FeatureSection>

      {/* Impulse Control Tracker */}
      <FeatureSection title="Impulse Control This Week">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-end justify-between gap-2 h-32">
            {weekLogs.length > 0 ? (
              weekLogs.slice(0, 7).reverse().map((log) => {
                const rating = log.impulse_control_rating || 0;
                const height = `${(rating / 5) * 100}%`;
                const date = new Date(log.log_date);
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });

                const colorClass = rating >= 4
                  ? 'from-emerald-400 to-emerald-600'
                  : rating >= 3
                  ? 'from-amber-400 to-amber-600'
                  : 'from-red-400 to-red-600';

                return (
                  <div key={log.id} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-20 flex items-end">
                      {rating > 0 ? (
                        <div
                          className={`w-full bg-gradient-to-t ${colorClass} rounded-t-lg transition-all`}
                          style={{ height }}
                        />
                      ) : (
                        <div className="w-full h-1 bg-slate-200 rounded" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{dayName}</span>
                    <span className="text-sm font-medium text-slate-700">
                      {rating || '-'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                No data for this week
              </div>
            )}
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            Rate your impulse control daily (1-5 scale)
          </p>
        </div>
      </FeatureSection>

      {/* Personal Goals */}
      <FeatureSection title="Personal Goals" actionHref="/dashboard/goals" actionLabel="Manage">
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.slice(0, 4).map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-2xl p-6 border border-slate-100"
              >
                <h3 className="font-bold text-slate-800 mb-2">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-slate-500">{goal.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-slate-500">No personal goals set</p>
            <Link
              href="/dashboard/goals"
              className="text-violet-600 hover:underline text-sm mt-2 inline-block"
            >
              Set your first goal →
            </Link>
          </div>
        )}
      </FeatureSection>

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureSection title="Daily Journal">
          <ComingSoon
            feature="Full Journal Experience"
            description="A dedicated space for daily reflections, gratitude practice, and self-discovery."
          />
        </FeatureSection>

        <FeatureSection title="AI Self-Insights">
          <ComingSoon
            feature="Pattern Recognition"
            description="AI-powered analysis of your journal entries to reveal patterns and growth opportunities."
          />
        </FeatureSection>
      </div>
    </DomainDashboard>
  );
}

