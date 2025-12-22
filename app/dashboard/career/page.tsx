'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, FeatureSection, EmptyDomainState, ComingSoon } from '@/components/dashboard/DomainDashboard';
import { MetricWidget } from '@/components/dashboard/widgets/BaseWidget';
import { Goal, GeneratedPlan } from '@/types/database';

const domainConfig = getDomainConfig('career');

interface CareerData {
  careerGoals: Goal[];
  plan: GeneratedPlan | null;
  totalLeetCode: number;
}

export default function CareerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CareerData | null>(null);
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

        // Fetch profile for plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('generated_plan')
          .eq('id', user.id)
          .single();

        // Fetch career goals
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'Career')
          .order('created_at', { ascending: false });

        // Fetch total leetcode
        const { data: logs } = await supabase
          .from('daily_logs')
          .select('leetcode_solved')
          .eq('user_id', user.id);

        const totalLeetCode = logs?.reduce((sum: number, log: { leetcode_solved: number | null }) => sum + (log.leetcode_solved || 0), 0) || 0;

        setData({
          careerGoals: goals || [],
          plan: profile?.generated_plan || null,
          totalLeetCode,
        });
      } catch (error) {
        console.error('Error fetching career data:', error);
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
          actionLabel="Set Career Goals"
          actionHref="/dashboard/goals"
        />
      </DomainDashboard>
    );
  }

  const { careerGoals, plan, totalLeetCode } = data;
  const activeGoals = careerGoals.filter(g => g.status === 'active');
  const completedGoals = careerGoals.filter(g => g.status === 'completed');

  return (
    <DomainDashboard
      config={domainConfig}
      todayProgress={
        activeGoals.length > 0
          ? { current: completedGoals.length, total: careerGoals.length }
          : undefined
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricWidget
          title="Active Goals"
          value={activeGoals.length}
          icon="🎯"
          subtitle="In progress"
        />
        <MetricWidget
          title="Completed"
          value={completedGoals.length}
          icon="✅"
          subtitle="Goals achieved"
        />
        <MetricWidget
          title="LeetCode"
          value={totalLeetCode}
          icon="💻"
          subtitle="Problems solved"
        />
        <MetricWidget
          title="Skills"
          value="Coming"
          icon="🛠️"
          subtitle="Soon"
        />
      </div>

      {/* Active Goals */}
      <FeatureSection
        title="Active Career Goals"
        actionHref="/dashboard/goals"
        actionLabel="Manage"
      >
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const progress = goal.target_value
                ? Math.round((goal.current_value / goal.target_value) * 100)
                : 0;

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl p-6 border border-slate-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-slate-500 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      goal.timeframe === 'short'
                        ? 'bg-green-100 text-green-700'
                        : goal.timeframe === 'mid'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {goal.timeframe}
                    </span>
                  </div>

                  {goal.target_value && (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-slate-700">
                          {goal.current_value} / {goal.target_value} {goal.unit || ''}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </>
                  )}

                  {goal.due_date && (
                    <p className="text-xs text-slate-400 mt-3">
                      Due: {new Date(goal.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-slate-500">No active career goals</p>
            <Link
              href="/dashboard/goals"
              className="text-violet-600 hover:underline text-sm mt-2 inline-block"
            >
              Set your first goal →
            </Link>
          </div>
        )}
      </FeatureSection>

      {/* Certifications Tracker */}
      <FeatureSection title="Certifications">
        <ComingSoon
          feature="Certification Tracker"
          description="Track your certification progress, study plans, and exam dates."
        />
      </FeatureSection>

      {/* Skills Development */}
      <FeatureSection title="Skills Development">
        <ComingSoon
          feature="Skills Matrix"
          description="Map and track your technical and soft skills development journey."
        />
      </FeatureSection>

      {/* AI Career Advisor */}
      <FeatureSection title="AI Career Advisor">
        <ComingSoon
          feature="AI Career Coach"
          description="Get personalized career advice, job market insights, and growth recommendations."
        />
      </FeatureSection>
    </DomainDashboard>
  );
}

