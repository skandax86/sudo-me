'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig, DomainConfig } from '@/lib/domains';
import { DomainDashboard, FeatureSection, EmptyDomainState, ComingSoon } from '@/components/dashboard/DomainDashboard';
import { BaseWidget, MetricWidget, ProgressWidget, ListWidget } from '@/components/dashboard/widgets/BaseWidget';
import { DailyLog, Workout } from '@/types/database';

const domainConfig = getDomainConfig('health');

interface HealthData {
  todayLog: DailyLog | null;
  recentWorkouts: Workout[];
  weeklyStats: {
    workoutsCompleted: number;
    avgWaterIntake: number;
    avgSleepHours: number;
  };
}

export default function HealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthData | null>(null);
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

        // Fetch today's log
        const today = new Date().toISOString().split('T')[0];
        const { data: todayLog } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .single();

        // Fetch recent workouts
        const { data: workouts } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('workout_date', { ascending: false })
          .limit(7);

        // Fetch week's logs for stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: weekLogs } = await supabase
          .from('daily_logs')
          .select('water_intake_oz, sleep_hours')
          .eq('user_id', user.id)
          .gte('log_date', weekAgo.toISOString().split('T')[0]);

        const weeklyStats = {
          workoutsCompleted: workouts?.length || 0,
          avgWaterIntake: weekLogs?.length
            ? Math.round(weekLogs.reduce((sum: number, log: { water_intake_oz: number | null }) => sum + (log.water_intake_oz || 0), 0) / weekLogs.length)
            : 0,
          avgSleepHours: weekLogs?.length
            ? (weekLogs.reduce((sum: number, log: { sleep_hours: number | null }) => sum + (log.sleep_hours || 0), 0) / weekLogs.length).toFixed(1)
            : 0,
        };

        setData({
          todayLog,
          recentWorkouts: workouts || [],
          weeklyStats: weeklyStats as any,
        });
      } catch (error) {
        console.error('Error fetching health data:', error);
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
          actionLabel="Log Your First Workout"
          actionHref="/dashboard/log"
        />
      </DomainDashboard>
    );
  }

  const { todayLog, recentWorkouts, weeklyStats } = data;

  return (
    <DomainDashboard
      config={domainConfig}
      streak={0}
      todayProgress={
        todayLog
          ? {
              current: [
                todayLog.workout_type !== null,
                (todayLog.water_intake_oz || 0) >= 64,
                (todayLog.sleep_hours || 0) >= 7,
              ].filter(Boolean).length,
              total: 3,
            }
          : undefined
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricWidget
          title="Workouts"
          value={weeklyStats.workoutsCompleted}
          icon="🏋️"
          subtitle="This week"
        />
        <MetricWidget
          title="Avg Water"
          value={`${weeklyStats.avgWaterIntake}oz`}
          icon="💧"
          subtitle="Daily average"
        />
        <MetricWidget
          title="Avg Sleep"
          value={`${weeklyStats.avgSleepHours}h`}
          icon="😴"
          subtitle="Per night"
        />
        <MetricWidget
          title="Today"
          value={todayLog?.workout_type || 'Rest'}
          icon="📅"
          subtitle="Workout type"
        />
      </div>

      {/* Today's Health */}
      <FeatureSection title="Today's Health Checklist" actionHref="/dashboard/log" actionLabel="Log">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <ProgressWidget
              title="Water Intake"
              current={todayLog?.water_intake_oz || 0}
              target={128}
              unit="oz"
              icon="💧"
              color="blue"
            />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <ProgressWidget
              title="Sleep"
              current={todayLog?.sleep_hours || 0}
              target={8}
              unit="h"
              icon="😴"
              color="indigo"
            />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>🏃</span>
                <span className="text-slate-700 font-medium">Workout</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                todayLog?.workout_type
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {todayLog?.workout_type || 'Not logged'}
              </span>
            </div>
          </div>
        </div>
      </FeatureSection>

      {/* Recent Workouts */}
      <FeatureSection title="Recent Workouts">
        {recentWorkouts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      {workout.workout_type === 'Gym' && '🏋️'}
                      {workout.workout_type === 'Run' && '🏃'}
                      {workout.workout_type === 'Calisthenics' && '💪'}
                      {workout.workout_type === 'Swim' && '🏊'}
                      {workout.workout_type === 'Rest' && '😴'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{workout.workout_type}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(workout.workout_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {workout.duration_mins && (
                      <p className="font-medium text-slate-800">{workout.duration_mins} min</p>
                    )}
                    {workout.distance_km && (
                      <p className="text-sm text-slate-500">{workout.distance_km} km</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-slate-500">No workouts logged yet</p>
            <Link
              href="/dashboard/log"
              className="text-violet-600 hover:underline text-sm mt-2 inline-block"
            >
              Log your first workout →
            </Link>
          </div>
        )}
      </FeatureSection>

      {/* AI Coach Placeholder */}
      <FeatureSection title="AI Fitness Coach">
        <ComingSoon
          feature="Personalized AI Coach"
          description="Get customized workout recommendations and nutrition tips based on your goals and progress."
        />
      </FeatureSection>
    </DomainDashboard>
  );
}

