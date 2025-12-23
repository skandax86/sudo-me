'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Target, 
  Award, 
  TrendingUp,
  Code,
  Globe,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, EmptyDomainState } from '@/components/dashboard/DomainDashboard';
import { ZenCard, ZenFade, ZenNumber, ZenProgress } from '@/components/zen';
import { 
  DailyActionsLayer, 
  WeeklyRhythmLayer, 
  ActiveProgramsLayer,
  LongTermVisionLayer 
} from '@/components/layers';
import { Goal, GeneratedPlan } from '@/types/database';

const domainConfig = getDomainConfig('career');

interface CareerData {
  careerGoals: Goal[];
  plan: GeneratedPlan | null;
  totalLeetCode: number;
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function CareerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CareerData | null>(null);
  const [dailyActions, setDailyActions] = useState({
    leetcode: false,
    apply: false,
    network: false,
    learn: false,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reset state on mount
    setLoading(true);
    setData(null);
    setDailyActions({ leetcode: false, apply: false, network: false, learn: false });
    
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
          .maybeSingle();

        // Fetch career goals
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('domain', 'career')
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
  }, [pathname]);

  if (loading) {
    return (
      <div className="p-8 bg-[var(--background)] min-h-screen">
        <div className="animate-pulse">
          <div className="h-48 bg-[var(--surface-card)] rounded-[28px] mb-6" />
          <div className="h-60 bg-[var(--surface-card)] rounded-[28px] mb-6" />
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

  const { careerGoals, totalLeetCode } = data;
  const activeGoals = careerGoals.filter(g => g.status === 'active');
  const completedGoals = careerGoals.filter(g => g.status === 'completed');
  const leetCodeTarget = 300;
  const isLeetCodeElite = totalLeetCode >= 100;

  // ============================================================================
  // LAYER 1: DAILY ACTIONS
  // "What do I do TODAY?"
  // ============================================================================
  const layer1Actions = [
    { 
      id: 'leetcode', 
      label: 'Solve 1+ LeetCode problem', 
      icon: <Code size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.leetcode 
    },
    { 
      id: 'apply', 
      label: 'Apply to 1 job (if actively looking)', 
      icon: <Briefcase size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.apply 
    },
    { 
      id: 'network', 
      label: 'Connect with 1 person', 
      icon: <Globe size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.network 
    },
    { 
      id: 'learn', 
      label: 'Learn something new', 
      icon: <TrendingUp size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.learn 
    },
  ];

  // ============================================================================
  // LAYER 2: WEEKLY RHYTHM
  // "What am I building THIS WEEK?"
  // ============================================================================
  const layer2Rhythms = [
    { 
      id: 'leetcode', 
      label: 'LeetCode Problems', 
      icon: '💻',
      current: Math.min(totalLeetCode % 21, 21), // Weekly progress
      target: 21,
      unit: 'solved',
      frequency: '3 per day'
    },
    { 
      id: 'certStudy', 
      label: 'Certification Study', 
      icon: '📚',
      current: 0, // Would track from study logs
      target: 5,
      unit: 'hours',
      frequency: '5 hours/week'
    },
    { 
      id: 'applications', 
      label: 'Job Applications', 
      icon: '📝',
      current: 0, // Would track from applications
      target: 5,
      unit: 'apps',
      frequency: '5 per week'
    },
  ];

  // ============================================================================
  // LAYER 3: ACTIVE PROGRAMS
  // "What am I building over MONTHS?"
  // ============================================================================
  const layer3Programs = [
    {
      id: 'jobSwitch',
      name: 'Job Switch / Move Abroad',
      icon: '🌍',
      category: 'Career Transition',
      startDate: 'Jan 2025',
      currentLevel: 'Preparing',
      nextMilestone: 'Get 20LPA offer or Amsterdam role',
      progressPercent: 25,
    },
    {
      id: 'aws',
      name: 'AWS Certification',
      icon: '☁️',
      category: 'Cloud Computing',
      startDate: 'Jan 2025',
      currentLevel: 'Studying',
      nextMilestone: 'Pass Solutions Architect exam',
      progressPercent: 30,
    },
    {
      id: 'databricks',
      name: 'Databricks Certification',
      icon: '🧱',
      category: 'Data Engineering',
      startDate: 'Feb 2025',
      currentLevel: 'Planned',
      nextMilestone: 'Start course',
      progressPercent: 10,
    },
  ];

  // ============================================================================
  // LAYER 4: LONG-TERM VISION
  // "Why am I doing all this?"
  // ============================================================================
  const layer4Goals = [
    {
      id: 'jobSwitch',
      title: 'Switch job: 20LPA or Amsterdam',
      icon: '🎯',
      timeframe: 'short' as const,
      domain: 'Career',
      progress: 25,
    },
    {
      id: 'leetcode',
      title: `Solve ${leetCodeTarget} LeetCode problems`,
      icon: '💻',
      timeframe: 'short' as const,
      domain: 'Technical Skills',
      progress: Math.min((totalLeetCode / leetCodeTarget) * 100, 100),
    },
    {
      id: 'certs',
      title: 'AWS + Databricks certifications',
      icon: '🏅',
      timeframe: 'short' as const,
      domain: 'Credentials',
      progress: 20,
    },
    {
      id: 'senior',
      title: 'Become a senior engineer',
      icon: '🚀',
      timeframe: 'mid' as const,
      domain: 'Role',
    },
    {
      id: 'financial',
      title: 'Financial independence through career',
      icon: '💎',
      timeframe: 'long' as const,
      domain: 'Life Goal',
    },
  ];

  // Handler for toggling daily actions
  const handleActionToggle = (id: string) => {
    setDailyActions(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  return (
    <DomainDashboard config={domainConfig}>
      {/* Hero Stats */}
      <ZenFade>
        <ZenCard className="mb-8 p-6" variant={isLeetCodeElite ? 'gold' : 'elevated'} halo={isLeetCodeElite}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">
                Career Progress
              </p>
              <div className="flex items-baseline gap-4">
                <div>
                  <ZenNumber 
                    value={activeGoals.length} 
                    className="text-4xl"
                  />
                  <p className="text-[var(--text-ghost)] text-xs">Active goals</p>
                </div>
                <div>
                  <ZenNumber 
                    value={completedGoals.length} 
                    className="text-4xl"
                    gold={completedGoals.length > 0}
                  />
                  <p className="text-[var(--text-ghost)] text-xs">Completed</p>
                </div>
                <div>
                  <ZenNumber 
                    value={totalLeetCode} 
                    className="text-4xl"
                    gold={isLeetCodeElite}
                  />
                  <p className="text-[var(--text-ghost)] text-xs">LeetCode</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/goals"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] rounded-2xl font-medium hover:opacity-90 transition-opacity"
            >
              Manage Goals
              <ArrowRight size={18} />
            </Link>
          </div>
        </ZenCard>
      </ZenFade>

      {/* LAYER 1: Daily Actions */}
      <DailyActionsLayer
        actions={layer1Actions}
        onActionToggle={handleActionToggle}
      />

      {/* LAYER 2: Weekly Rhythm */}
      <WeeklyRhythmLayer rhythms={layer2Rhythms} />

      {/* LAYER 3: Active Programs */}
      <ActiveProgramsLayer programs={layer3Programs} />

      {/* LAYER 4: Long-Term Vision (collapsed by default) */}
      <LongTermVisionLayer goals={layer4Goals} defaultCollapsed={true} />
    </DomainDashboard>
  );
}
