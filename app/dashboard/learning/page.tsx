'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Clock, 
  Target,
  Award,
  GraduationCap,
  ArrowRight,
  TrendingUp
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
import { DailyLog } from '@/types/database';

const domainConfig = getDomainConfig('learning');

interface LearningData {
  totalLeetCode: number;
  totalPagesRead: number;
  totalStudyHours: number;
  todayLog: DailyLog | null;
  weeklyStats: {
    leetcode: number;
    pages: number;
    hours: number;
  };
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LearningDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LearningData | null>(null);
  const [dailyActions, setDailyActions] = useState({
    leetcode: false,
    reading: false,
    study: false,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reset state on mount
    setLoading(true);
    setData(null);
    setDailyActions({ leetcode: false, reading: false, study: false });
    
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

        type LogEntry = { leetcode_solved: number | null; pages_read: number | null; study_hours: number | null; log_date: string };

        const today = new Date().toISOString().split('T')[0];
        const todayLog = logs?.find((log: LogEntry) => log.log_date === today) || null;

        // Initialize daily actions from today's log
        if (todayLog) {
          setDailyActions({
            leetcode: (todayLog.leetcode_solved || 0) > 0,
            reading: (todayLog.pages_read || 0) > 0,
            study: (todayLog.study_hours || 0) > 0,
          });
        }

        // Calculate totals
        const totalLeetCode = logs?.reduce((sum: number, log: LogEntry) => sum + (log.leetcode_solved || 0), 0) || 0;
        const totalPagesRead = logs?.reduce((sum: number, log: LogEntry) => sum + (log.pages_read || 0), 0) || 0;
        const totalStudyHours = logs?.reduce((sum: number, log: LogEntry) => sum + (log.study_hours || 0), 0) || 0;

        // Calculate weekly stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekLogs = logs?.filter((log: LogEntry) => new Date(log.log_date) >= weekAgo) || [];
        
        const weeklyStats = {
          leetcode: weekLogs.reduce((sum: number, log: LogEntry) => sum + (log.leetcode_solved || 0), 0),
          pages: weekLogs.reduce((sum: number, log: LogEntry) => sum + (log.pages_read || 0), 0),
          hours: weekLogs.reduce((sum: number, log: LogEntry) => sum + (log.study_hours || 0), 0),
        };

        setData({
          totalLeetCode,
          totalPagesRead,
          totalStudyHours,
          todayLog: todayLog as DailyLog | null,
          weeklyStats,
        });
      } catch (error) {
        console.error('Error fetching learning data:', error);
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
          actionLabel="Log Your Learning"
          actionHref="/dashboard/log"
        />
      </DomainDashboard>
    );
  }

  const { totalLeetCode, totalPagesRead, totalStudyHours, todayLog, weeklyStats } = data;
  const leetCodeTarget = 300;
  const booksTarget = 12; // 12 books = ~3000 pages (250 pages/book)
  const pagesPerBook = 250;
  const booksRead = Math.floor(totalPagesRead / pagesPerBook);
  const isLeetCodeElite = totalLeetCode >= leetCodeTarget;

  // ============================================================================
  // LAYER 1: DAILY ACTIONS
  // "What do I do TODAY?"
  // ============================================================================
  const layer1Actions = [
    { 
      id: 'leetcode', 
      label: 'Solve LeetCode problems', 
      icon: <Code size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.leetcode 
    },
    { 
      id: 'reading', 
      label: 'Read 10+ pages', 
      icon: <BookOpen size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.reading 
    },
    { 
      id: 'study', 
      label: 'Study / deep work session', 
      icon: <Clock size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.study 
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
      current: weeklyStats.leetcode, 
      target: 21, // 3/day
      unit: 'solved',
      frequency: '21 per week'
    },
    { 
      id: 'pages', 
      label: 'Pages Read', 
      icon: '📚',
      current: weeklyStats.pages, 
      target: 70, // 10/day
      unit: 'pages',
      frequency: '70 per week'
    },
    { 
      id: 'study', 
      label: 'Study Hours', 
      icon: '⏱️',
      current: Math.round(weeklyStats.hours * 10) / 10, 
      target: 10,
      unit: 'hours',
      frequency: '10 per week'
    },
  ];

  // ============================================================================
  // LAYER 3: ACTIVE PROGRAMS
  // "What am I learning over MONTHS?"
  // ============================================================================
  const layer3Programs = [
    {
      id: 'aws',
      name: 'AWS Certification',
      icon: '☁️',
      category: 'Cloud Computing',
      startDate: 'Jan 2025',
      currentLevel: 'Studying',
      nextMilestone: 'Pass exam',
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
    {
      id: 'dsa',
      name: 'DSA Mastery',
      icon: '🧮',
      category: 'Algorithms',
      startDate: 'Jan 2025',
      currentLevel: `${totalLeetCode} problems`,
      nextMilestone: `${leetCodeTarget} problems`,
      progressPercent: Math.min((totalLeetCode / leetCodeTarget) * 100, 100),
    },
  ];

  // ============================================================================
  // LAYER 4: LONG-TERM VISION
  // "Why am I doing all this?"
  // ============================================================================
  const layer4Goals = [
    {
      id: 'leetcode',
      title: `Solve ${leetCodeTarget} LeetCode problems`,
      icon: '💻',
      timeframe: 'short' as const,
      domain: 'Problem Solving',
      progress: Math.min((totalLeetCode / leetCodeTarget) * 100, 100),
    },
    {
      id: 'books',
      title: `Read ${booksTarget} books this year`,
      icon: '📚',
      timeframe: 'short' as const,
      domain: 'Knowledge',
      progress: Math.min((booksRead / booksTarget) * 100, 100),
    },
    {
      id: 'certs',
      title: 'Get AWS & Databricks certified',
      icon: '🎓',
      timeframe: 'short' as const,
      domain: 'Career',
      progress: 20,
    },
    {
      id: 'mastery',
      title: 'Become a senior-level engineer',
      icon: '🚀',
      timeframe: 'mid' as const,
      domain: 'Career Growth',
    },
    {
      id: 'lifelong',
      title: 'Lifelong learner identity',
      icon: '🧠',
      timeframe: 'long' as const,
      domain: 'Identity',
    },
  ];

  // Handler for toggling daily actions
  const handleActionToggle = (id: string) => {
    setDailyActions(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
    // TODO: Save to database
  };

  return (
    <DomainDashboard config={domainConfig}>
      {/* Hero Stats */}
      <ZenFade>
        <ZenCard className="mb-8 p-6" variant={isLeetCodeElite ? 'gold' : 'elevated'} halo={isLeetCodeElite}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">
                LeetCode Progress
              </p>
              <div className="flex items-baseline gap-2">
                <ZenNumber 
                  value={totalLeetCode} 
                  className="text-5xl" 
                  gold={isLeetCodeElite}
                />
                <span className="text-[var(--text-muted)] text-lg">/ {leetCodeTarget}</span>
              </div>
              <p className="text-[var(--text-ghost)] text-sm mt-2">
                {isLeetCodeElite 
                  ? '🎉 Goal achieved!' 
                  : `${leetCodeTarget - totalLeetCode} more to reach your target`}
              </p>
              <ZenProgress 
                value={(totalLeetCode / leetCodeTarget) * 100} 
                gold={isLeetCodeElite} 
                className="mt-4" 
              />
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-light text-[var(--text-primary)]">{totalPagesRead}</p>
                <p className="text-[var(--text-ghost)] text-xs">Pages read</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light text-[var(--text-primary)]">{Math.round(totalStudyHours)}h</p>
                <p className="text-[var(--text-ghost)] text-xs">Study hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light text-[var(--text-primary)]">{booksRead}</p>
                <p className="text-[var(--text-ghost)] text-xs">Books</p>
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
