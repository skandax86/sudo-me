'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Brain, 
  Sparkles, 
  BookOpen,
  Plane,
  Users,
  ArrowRight,
  PenLine,
  Smile
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
import { DailyLog, Goal } from '@/types/database';

const domainConfig = getDomainConfig('personal');

interface PersonalData {
  personalGoals: Goal[];
  todayLog: DailyLog | null;
  weekLogs: DailyLog[];
  avgImpulse: number;
  journalCount: number;
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function PersonalDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PersonalData | null>(null);
  const [dailyActions, setDailyActions] = useState({
    meditate: false,
    journal: false,
    impulse: false,
    gratitude: false,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reset state on mount
    setLoading(true);
    setData(null);
    setDailyActions({ meditate: false, journal: false, impulse: false, gratitude: false });
    
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
          .eq('domain', 'personal')
          .order('created_at', { ascending: false });

        // Fetch today's log
        const today = new Date().toISOString().split('T')[0];
        const { data: todayLog } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .maybeSingle();

        // Fetch week's logs
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: weekLogs } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', weekAgo.toISOString().split('T')[0])
          .order('log_date', { ascending: false });

        // Calculate stats
        const impulseRatings = (weekLogs || [])
          .map((log: DailyLog) => log.impulse_control_rating)
          .filter((r: number | null): r is 1 | 2 | 3 | 4 | 5 => r !== null && r >= 1 && r <= 5);
        const avgImpulse = impulseRatings.length > 0
          ? impulseRatings.reduce((a: number, b: number) => a + b, 0) / impulseRatings.length
          : 0;

        const journalCount = (weekLogs || []).filter((log: DailyLog) => log.notes && log.notes.length > 0).length;

        // Initialize daily actions from today's log
        if (todayLog) {
          setDailyActions({
            meditate: false, // Would come from habits
            journal: !!todayLog.notes,
            impulse: todayLog.impulse_control_rating !== null,
            gratitude: false, // Would come from habits
          });
        }

        setData({
          personalGoals: goals || [],
          todayLog,
          weekLogs: weekLogs || [],
          avgImpulse,
          journalCount,
        });
      } catch (error) {
        console.error('Error fetching personal data:', error);
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
          actionLabel="Start Your Journey"
          actionHref="/dashboard/log"
        />
      </DomainDashboard>
    );
  }

  const { personalGoals, todayLog, avgImpulse, journalCount } = data;
  const activeGoals = personalGoals.filter(g => g.status === 'active');
  const isImpulseElite = avgImpulse >= 4;

  // ============================================================================
  // LAYER 1: DAILY ACTIONS
  // "What do I do TODAY?"
  // ============================================================================
  const layer1Actions = [
    { 
      id: 'meditate', 
      label: 'Meditate 10 mins', 
      icon: <Brain size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.meditate 
    },
    { 
      id: 'journal', 
      label: 'Write daily reflection', 
      icon: <PenLine size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.journal 
    },
    { 
      id: 'impulse', 
      label: 'Rate impulse control', 
      icon: <Brain size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.impulse 
    },
    { 
      id: 'gratitude', 
      label: 'Practice gratitude', 
      icon: <Heart size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.gratitude 
    },
  ];

  // ============================================================================
  // LAYER 2: WEEKLY RHYTHM
  // "What am I building THIS WEEK?"
  // ============================================================================
  const layer2Rhythms = [
    { 
      id: 'journal', 
      label: 'Journal Entries', 
      icon: '📔',
      current: journalCount, 
      target: 7,
      unit: 'entries',
      frequency: 'Daily'
    },
    { 
      id: 'impulse', 
      label: 'Impulse Control Avg', 
      icon: '🧠',
      current: Math.round(avgImpulse * 10) / 10, 
      target: 5,
      unit: '/5',
      frequency: 'Weekly target'
    },
    { 
      id: 'selfControl', 
      label: 'Self Control Streak', 
      icon: '💎',
      current: 0, // Would track no-slip days
      target: 7,
      unit: 'days',
      frequency: 'This week'
    },
  ];

  // ============================================================================
  // LAYER 3: ACTIVE PROGRAMS
  // "What experiences am I building?"
  // ============================================================================
  const layer3Programs = [
    {
      id: 'travel',
      name: 'Travel Goals 2025',
      icon: '✈️',
      category: 'Experiences',
      startDate: 'Jan 2025',
      currentLevel: '0/4 trips',
      nextMilestone: '3 domestic + 1 international',
      progressPercent: 0,
    },
    {
      id: 'relationships',
      name: 'Relationship Building',
      icon: '❤️',
      category: 'Personal Life',
      startDate: 'Ongoing',
      currentLevel: 'Active',
      nextMilestone: 'Quality connections',
      progressPercent: 50,
    },
  ];

  // ============================================================================
  // LAYER 4: LONG-TERM VISION
  // "Why am I doing all this?"
  // ============================================================================
  const layer4Goals = [
    {
      id: 'selfControl',
      title: 'Master self-control & impulse management',
      icon: '💎',
      timeframe: 'short' as const,
      domain: 'Discipline',
      progress: Math.round((avgImpulse / 5) * 100),
    },
    {
      id: 'travel',
      title: '3 domestic + 1 international trip',
      icon: '✈️',
      timeframe: 'short' as const,
      domain: 'Experiences',
      progress: 0,
    },
    {
      id: 'balance',
      title: 'Work-life balance mastery',
      icon: '⚖️',
      timeframe: 'mid' as const,
      domain: 'Lifestyle',
    },
    {
      id: 'peace',
      title: 'Inner peace & emotional mastery',
      icon: '🧘',
      timeframe: 'long' as const,
      domain: 'Well-being',
    },
    {
      id: 'meaningful',
      title: 'Live a meaningful, intentional life',
      icon: '🌟',
      timeframe: 'long' as const,
      domain: 'Purpose',
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
        <ZenCard className="mb-8 p-6" variant={isImpulseElite ? 'gold' : 'elevated'} halo={isImpulseElite}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">
                Personal Growth
              </p>
              <div className="flex items-baseline gap-4">
                <div>
                  <ZenNumber 
                    value={avgImpulse} 
                    decimals={1}
                    className="text-4xl"
                    gold={isImpulseElite}
                  />
                  <p className="text-[var(--text-ghost)] text-xs">Impulse control</p>
                </div>
                <div>
                  <ZenNumber 
                    value={journalCount} 
                    className="text-4xl"
                  />
                  <p className="text-[var(--text-ghost)] text-xs">Journal entries</p>
                </div>
                <div>
                  <ZenNumber 
                    value={activeGoals.length} 
                    className="text-4xl"
                  />
                  <p className="text-[var(--text-ghost)] text-xs">Active goals</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/log"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] rounded-2xl font-medium hover:opacity-90 transition-opacity"
            >
              Log Today
              <ArrowRight size={18} />
            </Link>
          </div>
        </ZenCard>
      </ZenFade>

      {/* Today's Reflection Preview */}
      {todayLog?.notes && (
        <ZenFade delay={0.1}>
          <ZenCard className="mb-8 p-6">
            <div className="flex items-start gap-4">
              <Sparkles size={24} className="text-[var(--gold-primary)] mt-1" />
              <div>
                <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-2">
                  Today's Reflection
                </p>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {todayLog.notes}
                </p>
              </div>
            </div>
          </ZenCard>
        </ZenFade>
      )}

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
