'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  Wallet, 
  BookOpen, 
  Briefcase, 
  Heart,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Zap,
  Award
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { Profile, GeneratedPlan, DailyLog, Transaction } from '@/types/database';
import { DomainId, getDomainConfig, DomainSummary, mapFocusAreasToDomains, getDomainsByIds } from '@/lib/domains';
import { getCurrentPhase, getDaysElapsed } from '@/lib/utils';
import { ZenCard, ZenNumber, ZenProgress, ZenIcon, ZenFade, ZenFocusTab } from '@/components/zen';
import { ChallengeBanner } from '@/components/challenge';

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

// Domain icon mapping using Lucide
const domainIcons: Record<DomainId, typeof Activity> = {
  health: Activity,
  discipline: Brain,
  finance: Wallet,
  learning: BookOpen,
  career: Briefcase,
  personal: Heart,
};

// ============================================================================
// DIGITAL ZEN HERO SECTION - "The Quiet Core"
// ============================================================================

interface HeroProps {
  daysElapsed: number;
  planDuration: number;
  disciplineScore: number;
  phase: string;
}

function ZenHero({ daysElapsed, planDuration, disciplineScore, phase }: HeroProps) {
  const progressPercentage = Math.min((daysElapsed / planDuration) * 100, 100);
  const isGold = disciplineScore >= 90;

  return (
    <ZenFade>
      <div className="relative mb-12">
        {/* Phase indicator - uppercase, wide tracking */}
        <motion.p 
          className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {phase}
        </motion.p>

        {/* Day counter - large, thin weight */}
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span 
            className="text-[var(--text-muted)] text-lg font-light uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Day
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <span className={`text-7xl font-light tracking-tight ${isGold ? 'text-[var(--gold-primary)]' : 'text-[var(--text-primary)]'}`}
              style={isGold ? { textShadow: '0 0 40px rgba(198, 169, 106, 0.3)' } : undefined}
            >
              {daysElapsed}
            </span>
          </motion.div>
          <motion.span 
            className="text-[var(--text-ghost)] text-lg font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            of {planDuration}
          </motion.span>
        </div>

        {/* Full-width progress bar - thin stroke */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <ZenProgress value={progressPercentage} gold={isGold} />
        </motion.div>

        {/* Discipline Score - The large numeral */}
        <motion.div 
          className="flex items-end justify-between mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div>
            <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-2">
              Discipline Score
            </p>
            <div className="flex items-baseline gap-1">
              <ZenNumber 
                value={disciplineScore} 
                gold={isGold}
                className="text-6xl"
              />
              {isGold && (
                <motion.span
                  className="text-[var(--gold-primary)] text-sm font-medium ml-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  Elite
                </motion.span>
              )}
            </div>
          </div>
          
          {/* Streak indicator */}
          <motion.div
            className="text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-2">
              Streak
            </p>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Flame size={20} strokeWidth={1.5} className={isGold ? 'text-[var(--gold-primary)]' : ''} />
              <span className="text-2xl font-light">{daysElapsed}</span>
              <span className="text-[var(--text-ghost)] text-sm">days</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ZenFade>
  );
}

// ============================================================================
// ZEN METRIC CARD
// ============================================================================

interface MetricCardProps {
  icon: typeof Activity;
  title: string;
  value: number;
  suffix?: string;
  subtitle: string;
  gold?: boolean;
  delay?: number;
}

function ZenMetricCard({ icon: Icon, title, value, suffix = '', subtitle, gold = false, delay = 0 }: MetricCardProps) {
  return (
    <ZenFade delay={delay}>
      <ZenCard variant={gold ? 'gold' : 'default'} halo={gold}>
        <div className="flex items-start justify-between mb-4">
          <ZenIcon icon={Icon} gold={gold} />
          {gold && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 bg-[var(--gold-soft)] rounded-full"
            >
              <span className="text-[var(--gold-primary)] text-xs font-medium">Elite</span>
            </motion.div>
          )}
        </div>
        <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.05em] mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <ZenNumber value={value} suffix={suffix} gold={gold} className="text-3xl" />
        </div>
        <p className="text-[var(--text-ghost)] text-sm mt-2">{subtitle}</p>
      </ZenCard>
    </ZenFade>
  );
}

// ============================================================================
// ZEN DOMAIN CARD
// ============================================================================

interface DomainCardProps {
  domain: DomainId;
  summary?: DomainSummary;
  delay?: number;
}

function ZenDomainCard({ domain, summary, delay = 0 }: DomainCardProps) {
  const router = useRouter();
  const config = getDomainConfig(domain);
  const Icon = domainIcons[domain];
  const progress = summary ? (summary.completedActions / Math.max(summary.todayActions, 1)) * 100 : 0;
  const isComplete = progress >= 100;
  const streakDays = summary?.streak || 0;
  const isGold = streakDays >= 7;

  return (
    <ZenFade delay={delay}>
      <motion.div
        className="cursor-pointer"
        onClick={() => router.push(`/dashboard/${domain}`)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <ZenCard variant={isGold ? 'gold' : 'default'} halo={isGold}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ZenIcon icon={Icon} gold={isGold} />
              <div>
                <h3 className="text-[var(--text-primary)] font-medium">{config.name}</h3>
                <p className="text-[var(--text-ghost)] text-sm">{config.description}</p>
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronRight size={20} className="text-[var(--text-ghost)]" strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[var(--text-ghost)] mb-2">
              <span>Today&apos;s Progress</span>
              <span>{summary?.completedActions || 0}/{summary?.todayActions || 0}</span>
            </div>
            <ZenProgress value={progress} gold={isComplete} showPulse={false} />
          </div>

          {/* Streak indicator */}
          {streakDays > 0 && (
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
              <Flame size={14} strokeWidth={1.5} className={isGold ? 'text-[var(--gold-primary)]' : ''} />
              <span>{streakDays} day streak</span>
            </div>
          )}
        </ZenCard>
      </motion.div>
    </ZenFade>
  );
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    // Reset state on mount
    setLoading(true);
    setData(null);
    setError(null);
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      if (!isSupabaseReady()) {
        throw new Error('Database not connected');
      }

      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Redirect to template selection if not set
      if (!profile?.template_type || !profile?.onboarding_complete) {
        router.replace('/onboarding/template');
        return;
      }

      // Plan is stored in profiles.generated_plan
      const plan = profile?.generated_plan || null;

      // Load today's log
      const today = new Date().toISOString().split('T')[0];
      const { data: todayLog } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .maybeSingle();

      // Load recent transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('datetime', { ascending: false })
        .limit(5);

      // Calculate stats
      const planDuration = plan?.duration_days || 75;
      // Use profile start_date or current date as fallback
      const startDate = profile?.start_date || new Date().toISOString().split('T')[0];
      const daysElapsed = getDaysElapsed(startDate);
      const phase = getCurrentPhase(daysElapsed);
      
      // Get discipline score - use date column from discipline_scores table
      const { data: scoreData } = await supabase
        .from('discipline_scores')
        .select('total_score')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const disciplineScore = scoreData?.total_score || 0;

      // Get domain summaries
      const focusAreas = plan?.focus_areas || profile?.focus_areas || ['health', 'discipline'];
      const selectedDomains = mapFocusAreasToDomains(focusAreas);
      
      // Create placeholder summaries
      const domainSummaries: Record<DomainId, DomainSummary | null> = {} as Record<DomainId, DomainSummary | null>;
      for (const domainId of selectedDomains) {
        const completedActions = Math.floor(Math.random() * 5);
        const streak = Math.floor(Math.random() * 14);
        domainSummaries[domainId] = {
          domainId,
          todayActions: 5,
          completedActions,
          streak,
          primaryMetric: {
            label: 'Progress',
            value: `${completedActions}/5`,
            trend: completedActions >= 3 ? 'up' : completedActions >= 1 ? 'neutral' : 'down',
          },
        };
      }

      setData({
        profile,
        plan,
        todayLog,
        recentTransactions: transactions || [],
        stats: {
          daysElapsed,
          phase,
          disciplineScore,
          totalLeetCode: 0,
          totalInvested: 0,
          planDuration,
        },
        domainSummaries,
        selectedDomains,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-8">
        <ZenIcon icon={Target} size={48} />
        <p className="text-[var(--text-muted)] mt-4">{error || 'Something went wrong'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-[var(--gold-primary)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const { stats, selectedDomains, domainSummaries, profile } = data;
  const isGold = stats.disciplineScore >= 90;

  // Focus tabs
  const tabs = [
    { id: 'all', label: 'All' },
    ...selectedDomains.slice(0, 3).map(d => ({
      id: d,
      label: getDomainConfig(d).name,
      icon: domainIcons[d],
    })),
  ];

  const filteredDomains = activeTab === 'all' 
    ? selectedDomains 
    : selectedDomains.filter(d => d === activeTab);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Challenge Banner */}
        <ChallengeBanner />

        {/* Welcome */}
        <ZenFade>
          <p className="text-[var(--text-ghost)] text-sm mb-2">
            Welcome back, <span className="text-[var(--text-secondary)]">{profile?.name || 'Traveler'}</span>
          </p>
        </ZenFade>

        {/* Hero Section - The Quiet Core */}
        <ZenHero 
          daysElapsed={stats.daysElapsed}
          planDuration={stats.planDuration}
          disciplineScore={stats.disciplineScore}
          phase={stats.phase}
        />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <ZenMetricCard
            icon={Flame}
            title="Streak"
            value={stats.daysElapsed}
            subtitle="Consecutive days"
            gold={stats.daysElapsed >= 7}
            delay={0.1}
          />
          <ZenMetricCard
            icon={Target}
            title="Score"
            value={stats.disciplineScore}
            subtitle="Today's discipline"
            gold={isGold}
            delay={0.2}
          />
          <ZenMetricCard
            icon={TrendingUp}
            title="Progress"
            value={Math.round((stats.daysElapsed / stats.planDuration) * 100)}
            suffix="%"
            subtitle="Journey completion"
            delay={0.3}
          />
          <ZenMetricCard
            icon={Award}
            title="Level"
            value={Math.floor(stats.daysElapsed / 7) + 1}
            subtitle="Current tier"
            gold={Math.floor(stats.daysElapsed / 7) >= 4}
            delay={0.4}
          />
        </div>

        {/* Focus Areas */}
        <ZenFade delay={0.5}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[var(--text-primary)] text-lg font-light tracking-wide">
                Focus Areas
              </h2>
              <ZenFocusTab 
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredDomains.map((domain, idx) => (
                <ZenDomainCard
                  key={domain}
                  domain={domain}
                  summary={domainSummaries[domain] || undefined}
                  delay={0.1 * idx}
                />
              ))}
            </div>
          </div>
        </ZenFade>

        {/* Quick Actions */}
        <ZenFade delay={0.7}>
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link href="/dashboard/log" className="flex-1">
              <motion.div
                className="p-4 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center gap-4 cursor-pointer"
                whileHover={{ y: -2, borderColor: 'var(--gold-primary)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--gold-soft)] flex items-center justify-center">
                  <Calendar size={20} className="text-[var(--gold-primary)]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[var(--text-primary)] font-medium">Daily Log</p>
                  <p className="text-[var(--text-ghost)] text-sm">Close today&apos;s chapter</p>
                </div>
                <ChevronRight size={20} className="text-[var(--text-ghost)] ml-auto" strokeWidth={1.5} />
              </motion.div>
            </Link>
            
            <Link href="/dashboard/scorecard" className="flex-1">
              <motion.div
                className="p-4 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center gap-4 cursor-pointer"
                whileHover={{ y: -2, borderColor: 'var(--gold-primary)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                  <Zap size={20} className="text-[var(--text-muted)]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[var(--text-primary)] font-medium">Scorecard</p>
                  <p className="text-[var(--text-ghost)] text-sm">View detailed analytics</p>
                </div>
                <ChevronRight size={20} className="text-[var(--text-ghost)] ml-auto" strokeWidth={1.5} />
              </motion.div>
            </Link>
          </div>
        </ZenFade>
      </div>
    </div>
  );
}
