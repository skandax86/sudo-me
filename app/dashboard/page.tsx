'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { Profile, GeneratedPlan, DailyLog, Transaction } from '@/types/database';
import { DomainId, getDomainConfig, DomainSummary, mapFocusAreasToDomains, getDomainsByIds } from '@/lib/domains';
import { DomainCard } from '@/components/dashboard/DomainCard';
import { BaseWidget, MetricWidget, ListWidget, ListItem } from '@/components/dashboard/widgets/BaseWidget';
import { getCurrentPhase, getDaysElapsed } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardData {
  profile: Profile | null;
  plan: GeneratedPlan | null;
  todayLog: DailyLog | null;
  recentTransactions: Transaction[];
  stats: {
    daysElapsed: number;
    phase: string;
    disciplineScore: number;
    totalLeetCode: number;
    totalInvested: number;
    planDuration: number;
  };
  domainSummaries: Record<DomainId, DomainSummary | null>;
  selectedDomains: DomainId[];
}

// ============================================================================
// HERO SECTION
// ============================================================================

interface HeroProps {
  plan: GeneratedPlan | null;
  daysElapsed: number;
  planDuration: number;
  phase: string;
  coachingTip?: string;
}

function HeroSection({ plan, daysElapsed, planDuration, phase, coachingTip }: HeroProps) {
  const progressPercentage = Math.min((daysElapsed / planDuration) * 100, 100);

  return (
    <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl shadow-violet-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-violet-200 mb-1">{plan?.planName || 'Your Journey'}</p>
          <h2 className="text-5xl font-bold">Day {daysElapsed}</h2>
          <p className="text-violet-200 mt-2">
            of {planDuration} days • Phase: {phase}
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold">{progressPercentage.toFixed(0)}%</div>
          <p className="text-violet-200">Complete</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-white/20 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-white h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Coaching Tip */}
      {coachingTip && (
        <div className="mt-6 p-4 bg-white/10 rounded-xl">
          <p className="text-sm text-violet-100">
            💡 <span className="font-medium">Coach:</span> {coachingTip}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// QUICK STATS
// ============================================================================

interface QuickStatsProps {
  stats: DashboardData['stats'];
  streak: number;
}

function QuickStats({ stats, streak }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <MetricWidget
        title="Discipline"
        value={`${stats.disciplineScore}%`}
        icon="🎯"
        subtitle="Today's Score"
      />
      <MetricWidget
        title="Streak"
        value={streak}
        icon="🔥"
        subtitle="Days Strong"
      />
      <MetricWidget
        title="Progress"
        value={`${Math.round((stats.daysElapsed / stats.planDuration) * 100)}%`}
        icon="📈"
        subtitle={`Day ${stats.daysElapsed}`}
      />
      <MetricWidget
        title="Phase"
        value={stats.phase}
        icon="🚀"
        subtitle={`of ${stats.planDuration} days`}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function DashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDashboardData() {
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

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) {
          router.push('/auth/login');
          return;
        }

        // Check onboarding
        if (!profile.onboarding_complete) {
          router.push('/onboarding');
          return;
        }

        const plan = profile.generated_plan;
        const planDuration = plan?.duration || 90;
        const days = getDaysElapsed(new Date(profile.start_date));
        const phase = getCurrentPhase(days);

        // Extract focus areas
        let focusAreas: string[] = [];
        if (profile.preferences?.focusAreas) {
          focusAreas = profile.preferences.focusAreas;
        } else if ((profile.preferences as any)?.primaryFocus) {
          focusAreas = [(profile.preferences as any).primaryFocus];
        }
        
        const selectedDomains = mapFocusAreasToDomains(focusAreas);

        // Fetch today's log
        const today = new Date().toISOString().split('T')[0];
        const { data: todayLog } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .single();

        // Fetch LeetCode total
        const { data: logs } = await supabase
          .from('daily_logs')
          .select('leetcode_solved, discipline_score')
          .eq('user_id', user.id);

        const totalLeetCode = logs?.reduce((sum: number, log: { leetcode_solved: number | null }) => sum + (log.leetcode_solved || 0), 0) || 0;

        // Fetch transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })
          .limit(10);

        const totalInvested = transactions
          ?.filter((tx: Transaction) => tx.category === 'Investments')
          .reduce((sum: number, tx: Transaction) => sum + Number(tx.amount), 0) || 0;

        // Build domain summaries
        const domainSummaries: Record<DomainId, DomainSummary | null> = {} as Record<DomainId, DomainSummary | null>;
        
        for (const domainId of selectedDomains) {
          domainSummaries[domainId] = await fetchDomainSummary(supabase, user.id, domainId, todayLog, transactions || []);
        }

        setData({
          profile,
          plan,
          todayLog,
          recentTransactions: transactions || [],
          stats: {
            daysElapsed: days,
            phase,
            disciplineScore: todayLog?.discipline_score || 0,
            totalLeetCode,
            totalInvested,
            planDuration,
          },
          domainSummaries,
          selectedDomains,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-48 bg-slate-200 rounded-2xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { profile, plan, stats, selectedDomains, domainSummaries, todayLog, recentTransactions } = data;
  const dailyHabits = plan?.dailyHabits || [];
  const domains = getDomainsByIds(selectedDomains);

  return (
    <div className="p-4 md:p-8">
      {/* Hero Section */}
      <HeroSection
        plan={plan}
        daysElapsed={stats.daysElapsed}
        planDuration={stats.planDuration}
        phase={stats.phase}
        coachingTip={plan?.coachingTip}
      />

      {/* Quick Stats */}
      <QuickStats stats={stats} streak={profile?.current_streak || 0} />

      {/* Domain Cards Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Your Focus Areas</h2>
          <Link
            href="/dashboard/settings"
            className="text-violet-600 text-sm font-medium hover:underline"
          >
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map(domain => (
            <DomainCard
              key={domain.id}
              config={domain}
              summary={domainSummaries[domain.id] || undefined}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section: Habits + Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Habits */}
        <BaseWidget
          title="Today's Habits"
          icon="✅"
          actionHref="/dashboard/log"
          actionLabel="Log →"
        >
          {dailyHabits.length > 0 ? (
            <ListWidget
              items={dailyHabits.slice(0, 5).map((habit: any, idx: number) => ({
                id: String(idx),
                title: habit.name,
                subtitle: habit.target,
                icon: habit.icon || '✅',
              }))}
            />
          ) : todayLog ? (
            <ListWidget
              items={[
                { id: '1', title: 'Woke up at 6 AM', icon: '⏰', isComplete: todayLog.woke_up_at_6am },
                { id: '2', title: 'Cold shower', icon: '🚿', isComplete: todayLog.cold_shower },
                { id: '3', title: 'No phone first hour', icon: '📵', isComplete: todayLog.no_phone_first_hour },
                { id: '4', title: 'Meditated', icon: '🧘', isComplete: todayLog.meditated },
                { id: '5', title: 'Planned tomorrow', icon: '📋', isComplete: todayLog.planned_tomorrow },
              ]}
            />
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-4xl mb-2">📝</p>
              <p>No log for today yet</p>
              <Link href="/dashboard/log" className="text-violet-600 hover:underline text-sm mt-2 block">
                Start logging →
              </Link>
            </div>
          )}
        </BaseWidget>

        {/* Recent Transactions */}
        <BaseWidget
          title="Recent Transactions"
          icon="💰"
          actionHref="/dashboard/finance"
          actionLabel="View All →"
          isEmpty={recentTransactions.length === 0}
          emptyMessage="No transactions yet"
          emptyIcon="💰"
        >
          <ListWidget
            items={recentTransactions.slice(0, 5).map(tx => ({
              id: tx.id,
              title: tx.description || tx.category,
              subtitle: tx.category,
              rightContent: (
                <span className={`font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'Income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                </span>
              ),
            }))}
          />
        </BaseWidget>
      </div>

      {/* Weekly Goals */}
      {plan?.weeklyGoals && plan.weeklyGoals.length > 0 && (
        <div className="mt-6">
          <BaseWidget title="Weekly Focus" icon="🎯">
            <div className="flex flex-wrap gap-3">
              {plan.weeklyGoals.map((goal: string, idx: number) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full font-medium"
                >
                  {goal}
                </span>
              ))}
            </div>
          </BaseWidget>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER: Fetch Domain Summary
// ============================================================================

async function fetchDomainSummary(
  supabase: any,
  userId: string,
  domainId: DomainId,
  todayLog: DailyLog | null,
  transactions: Transaction[]
): Promise<DomainSummary | null> {
  const config = getDomainConfig(domainId);

  switch (domainId) {
    case 'health':
    case 'discipline': {
      if (todayLog) {
        const habits = [
          todayLog.woke_up_at_6am,
          todayLog.cold_shower,
          todayLog.no_phone_first_hour,
          todayLog.meditated,
          todayLog.planned_tomorrow,
        ];
        return {
          domainId,
          todayActions: 5,
          completedActions: habits.filter(Boolean).length,
          streak: 0,
          primaryMetric: {
            label: 'Discipline Score',
            value: `${todayLog.discipline_score || 0}%`,
          },
        };
      }
      return {
        domainId,
        todayActions: 5,
        completedActions: 0,
        streak: 0,
        primaryMetric: {
          label: 'Discipline Score',
          value: '0%',
        },
        nextAction: {
          title: 'Log your habits',
        },
      };
    }

    case 'finance': {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const monthlySpent = transactions
        .filter(tx => tx.type === 'Expense' && tx.transaction_date >= monthStart.split('T')[0])
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      return {
        domainId,
        todayActions: 1,
        completedActions: transactions.length > 0 ? 1 : 0,
        streak: 0,
        primaryMetric: {
          label: 'Spent This Month',
          value: `₹${monthlySpent.toLocaleString()}`,
        },
      };
    }

    case 'learning': {
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('leetcode_solved, pages_read')
        .eq('user_id', userId);

      const totalLeetcode = logs?.reduce((sum: number, log: any) => sum + (log.leetcode_solved || 0), 0) || 0;

      return {
        domainId,
        todayActions: 3,
        completedActions: todayLog ? 1 : 0,
        streak: 0,
        primaryMetric: {
          label: 'LeetCode Solved',
          value: totalLeetcode,
        },
      };
    }

    case 'career': {
      return {
        domainId,
        todayActions: 0,
        completedActions: 0,
        streak: 0,
        primaryMetric: {
          label: 'Tasks',
          value: 'Coming soon',
        },
      };
    }

    case 'personal': {
      return {
        domainId,
        todayActions: 0,
        completedActions: 0,
        streak: 0,
        primaryMetric: {
          label: 'Journal Entries',
          value: 'Coming soon',
        },
      };
    }

    default:
      return null;
  }
}
