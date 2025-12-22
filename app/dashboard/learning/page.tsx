'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, FeatureSection, EmptyDomainState, ComingSoon } from '@/components/dashboard/DomainDashboard';
import { BaseWidget, MetricWidget, ProgressWidget } from '@/components/dashboard/widgets/BaseWidget';
import { DailyLog } from '@/types/database';

const domainConfig = getDomainConfig('learning');

interface LearningData {
  totalLeetCode: number;
  totalPagesRead: number;
  totalStudyHours: number;
  todayLog: DailyLog | null;
  recentLogs: DailyLog[];
}

export default function LearningDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LearningData | null>(null);
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

        // Fetch all logs for totals
        const { data: logs } = await supabase
          .from('daily_logs')
          .select('leetcode_solved, pages_read, study_hours, log_date')
          .eq('user_id', user.id)
          .order('log_date', { ascending: false });

        // Fetch today's log
        const today = new Date().toISOString().split('T')[0];
        type LogEntry = { leetcode_solved: number | null; pages_read: number | null; study_hours: number | null; log_date: string };
        const todayLog = logs?.find((log: LogEntry) => log.log_date === today) || null;

        const totalLeetCode = logs?.reduce((sum: number, log: LogEntry) => sum + (log.leetcode_solved || 0), 0) || 0;
        const totalPagesRead = logs?.reduce((sum: number, log: LogEntry) => sum + (log.pages_read || 0), 0) || 0;
        const totalStudyHours = logs?.reduce((sum: number, log: LogEntry) => sum + (log.study_hours || 0), 0) || 0;

        setData({
          totalLeetCode,
          totalPagesRead,
          totalStudyHours,
          todayLog: todayLog as DailyLog | null,
          recentLogs: (logs || []).slice(0, 7) as DailyLog[],
        });
      } catch (error) {
        console.error('Error fetching learning data:', error);
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
          actionLabel="Log Your Learning"
          actionHref="/dashboard/log"
        />
      </DomainDashboard>
    );
  }

  const { totalLeetCode, totalPagesRead, totalStudyHours, todayLog, recentLogs } = data;
  const leetCodeTarget = 300; // From constants

  return (
    <DomainDashboard
      config={domainConfig}
      todayProgress={
        todayLog
          ? {
              current: [
                (todayLog.leetcode_solved || 0) > 0,
                (todayLog.pages_read || 0) > 0,
                (todayLog.study_hours || 0) > 0,
              ].filter(Boolean).length,
              total: 3,
            }
          : undefined
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricWidget
          title="LeetCode"
          value={totalLeetCode}
          icon="💻"
          subtitle={`of ${leetCodeTarget} target`}
          color={totalLeetCode >= leetCodeTarget ? 'success' : 'default'}
        />
        <MetricWidget
          title="Pages Read"
          value={totalPagesRead}
          icon="📚"
          subtitle="Total"
        />
        <MetricWidget
          title="Study Hours"
          value={totalStudyHours.toFixed(1)}
          icon="⏱️"
          subtitle="Total hours"
        />
        <MetricWidget
          title="Today"
          value={todayLog?.study_hours || 0}
          icon="📅"
          subtitle="Hours studied"
        />
      </div>

      {/* LeetCode Progress */}
      <FeatureSection title="LeetCode Progress" actionHref="/dashboard/log" actionLabel="Log">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold text-slate-800">{totalLeetCode}</p>
              <p className="text-slate-500">problems solved</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-cyan-600">
                {Math.round((totalLeetCode / leetCodeTarget) * 100)}%
              </p>
              <p className="text-slate-500 text-sm">of {leetCodeTarget} goal</p>
            </div>
          </div>
          
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalLeetCode / leetCodeTarget) * 100, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-cyan-50 rounded-xl">
              <p className="text-2xl font-bold text-cyan-700">{leetCodeTarget - totalLeetCode}</p>
              <p className="text-xs text-cyan-600">Remaining</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">
                {recentLogs.length > 0
                  ? Math.round(recentLogs.reduce((sum, log) => sum + (log.leetcode_solved || 0), 0) / recentLogs.length)
                  : 0}
              </p>
              <p className="text-xs text-blue-600">Daily Avg</p>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-xl">
              <p className="text-2xl font-bold text-indigo-700">
                {todayLog?.leetcode_solved || 0}
              </p>
              <p className="text-xs text-indigo-600">Today</p>
            </div>
          </div>
        </div>
      </FeatureSection>

      {/* Today's Learning */}
      <FeatureSection title="Today's Learning" actionHref="/dashboard/log" actionLabel="Log">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💻</span>
              <h3 className="font-bold text-slate-700">LeetCode</h3>
            </div>
            <p className="text-4xl font-bold text-cyan-600 mb-1">
              {todayLog?.leetcode_solved || 0}
            </p>
            <p className="text-slate-500 text-sm">problems solved</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📖</span>
              <h3 className="font-bold text-slate-700">Reading</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-1">
              {todayLog?.pages_read || 0}
            </p>
            <p className="text-slate-500 text-sm">pages read</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📚</span>
              <h3 className="font-bold text-slate-700">Study Time</h3>
            </div>
            <p className="text-4xl font-bold text-indigo-600 mb-1">
              {todayLog?.study_hours || 0}h
            </p>
            <p className="text-slate-500 text-sm">hours studied</p>
          </div>
        </div>
      </FeatureSection>

      {/* Weekly Progress Chart */}
      <FeatureSection title="This Week's Learning">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-end justify-between gap-2 h-32">
            {recentLogs.length > 0 ? (
              recentLogs.slice(0, 7).reverse().map((log, idx) => {
                const leetcode = log.leetcode_solved || 0;
                const maxLeetcode = Math.max(...recentLogs.map(l => l.leetcode_solved || 0), 1);
                const height = `${(leetcode / maxLeetcode) * 100}%`;
                const date = new Date(log.log_date);
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });

                return (
                  <div key={log.log_date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-20 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all"
                        style={{ height: height || '4px' }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{dayName}</span>
                    <span className="text-sm font-medium text-slate-700">{leetcode}</span>
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

      {/* AI Learning Path Placeholder */}
      <FeatureSection title="AI Learning Path">
        <ComingSoon
          feature="Personalized Learning Path"
          description="Get a customized curriculum based on your goals, progress, and learning style."
        />
      </FeatureSection>
    </DomainDashboard>
  );
}

