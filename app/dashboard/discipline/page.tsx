'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Shield, 
  Target, 
  CheckCircle2,
  Calendar,
  TrendingUp,
  Sparkles,
  Brain,
  Clock,
  Phone,
  Snowflake,
  BookOpen
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, EmptyDomainState } from '@/components/dashboard/DomainDashboard';
import { ZenCard, ZenFade, ZenNumber, ZenProgress } from '@/components/zen';
import { 
  DailyActionsLayer, 
  WeeklyRhythmLayer, 
  LongTermVisionLayer 
} from '@/components/layers';
import { Streak, Habit, HabitLog } from '@/types/database';

const domainConfig = getDomainConfig('discipline');

interface DisciplineData {
  streak: Streak | null;
  habits: Habit[];
  todayLogs: HabitLog[];
  weeklyCompletion: number;
}

// ============================================================================
// STREAK HERO SECTION
// ============================================================================

function StreakHero({ streak, forgiveness }: { streak: Streak | null; forgiveness: number }) {
  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const isElite = currentStreak >= 21;

  return (
    <ZenFade>
      <ZenCard variant={isElite ? 'gold' : 'elevated'} halo={isElite} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-2">
              Current Streak
            </p>
            <div className="flex items-baseline gap-2">
              <ZenNumber 
                value={currentStreak} 
                className="text-6xl" 
                gold={isElite}
              />
              <span className="text-[var(--text-muted)] text-xl">days</span>
            </div>
            <p className="text-[var(--text-secondary)] mt-2">
              {currentStreak >= 90 && '🏆 Transformation master!'}
              {currentStreak >= 30 && currentStreak < 90 && '👑 Monthly champion!'}
              {currentStreak >= 21 && currentStreak < 30 && '⚡ Habits automatic!'}
              {currentStreak >= 14 && currentStreak < 21 && '💪 Two weeks strong!'}
              {currentStreak >= 7 && currentStreak < 14 && '🔥 Week warrior!'}
              {currentStreak >= 3 && currentStreak < 7 && '✨ Building momentum!'}
              {currentStreak >= 1 && currentStreak < 3 && '🌱 Every day counts!'}
              {currentStreak === 0 && 'Start your streak today!'}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-light text-[var(--text-primary)]">{longestStreak}</p>
              <p className="text-[var(--text-ghost)] text-xs">Longest</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-light text-[var(--text-primary)]">{forgiveness}/2</p>
              <p className="text-[var(--text-ghost)] text-xs">Protected</p>
            </div>
            <div className="text-center">
              <Flame size={28} className={isElite ? 'text-[var(--gold-primary)]' : 'text-[var(--text-muted)]'} />
              <p className="text-[var(--text-ghost)] text-xs mt-1">Active</p>
            </div>
          </div>
        </div>

        {/* Streak Protection Info */}
        {forgiveness > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-[var(--surface-2)] flex items-center gap-3">
            <Shield size={18} className="text-[var(--gold-primary)]" />
            <p className="text-[var(--text-secondary)] text-sm">
              <strong>Streak Protection:</strong> {forgiveness} forgiveness day{forgiveness > 1 ? 's' : ''} left this month.
            </p>
          </div>
        )}
      </ZenCard>
    </ZenFade>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DisciplinePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DisciplineData | null>(null);
  const [dailyActions, setDailyActions] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reset state on mount
    setLoading(true);
    setData(null);
    setDailyActions({});
    
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

        const today = new Date().toISOString().split('T')[0];

        // Fetch streak, habits, and today's habit logs
        const [{ data: streak }, { data: habits }, { data: habitLogs }] = await Promise.all([
          supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('habits').select('*').eq('user_id', user.id).eq('active', true).order('sort_order'),
          supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('log_date', today),
        ]);

        // Build daily actions state from logs
        const logMap: Record<string, boolean> = {};
        habitLogs?.forEach((log: HabitLog) => {
          logMap[log.habit_id] = log.completed;
        });

        setDailyActions(logMap);

        // Calculate weekly completion
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: weekLogs } = await supabase
          .from('habit_logs')
          .select('completed')
          .eq('user_id', user.id)
          .gte('log_date', weekAgo.toISOString().split('T')[0]);

        const totalLogs = weekLogs?.length || 0;
        const completedLogs = weekLogs?.filter((l: { completed: boolean }) => l.completed).length || 0;
        const weeklyCompletion = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

        setData({
          streak,
          habits: habits || [],
          todayLogs: habitLogs || [],
          weeklyCompletion,
        });
      } catch (error) {
        console.error('Error fetching discipline data:', error);
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
          actionLabel="Start Building Habits"
          actionHref="/dashboard/settings"
        />
      </DomainDashboard>
    );
  }

  const { streak, habits, weeklyCompletion } = data;
  const forgiveness = 2 - (streak?.forgiveness_used_this_month || 0);

  // ============================================================================
  // LAYER 1: DAILY ACTIONS
  // "What do I do TODAY?"
  // ============================================================================
  const habitIcons: Record<string, typeof Clock> = {
    'wake': Clock,
    'shower': Snowflake,
    'phone': Phone,
    'meditate': Brain,
    'plan': Target,
    'workout': TrendingUp,
    'read': BookOpen,
  };

  const layer1Actions = habits.slice(0, 7).map(habit => ({
    id: habit.id,
    label: habit.name,
    icon: (() => {
      const Icon = habitIcons[habit.icon || ''] || CheckCircle2;
      return <Icon size={18} className="text-[var(--text-muted)]" />;
    })(),
    completed: dailyActions[habit.id] || false,
  }));

  // Handler for toggling daily actions
  const handleActionToggle = async (id: string) => {
    const newValue = !dailyActions[id];
    setDailyActions(prev => ({ ...prev, [id]: newValue }));
    
    // Save to database
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('habit_logs')
        .upsert({
          user_id: user.id,
          habit_id: id,
          log_date: today,
          completed: newValue,
        }, { onConflict: 'habit_id,log_date' });
    } catch (error) {
      console.error('Error saving habit log:', error);
    }
  };

  // ============================================================================
  // LAYER 2: WEEKLY RHYTHM
  // "What am I building THIS WEEK?"
  // ============================================================================
  const layer2Rhythms = [
    { 
      id: 'completion', 
      label: 'Habit Completion', 
      icon: '✅',
      current: weeklyCompletion, 
      target: 100, 
      unit: '%',
      frequency: 'Weekly target'
    },
    { 
      id: 'streak', 
      label: 'Streak Days', 
      icon: '🔥',
      current: Math.min(streak?.current_streak || 0, 7), 
      target: 7, 
      unit: 'days',
      frequency: 'This week'
    },
  ];

  // ============================================================================
  // LAYER 4: LONG-TERM VISION
  // "Why am I doing all this?"
  // ============================================================================
  const layer4Goals = [
    {
      id: 'consistency',
      title: 'Build unbreakable consistency',
      icon: '💎',
      timeframe: 'short' as const,
      domain: 'Discipline',
      progress: Math.min(weeklyCompletion, 100),
    },
    {
      id: 'automation',
      title: 'Make habits automatic (21+ day streak)',
      icon: '⚡',
      timeframe: 'short' as const,
      domain: 'Behavior',
      progress: Math.min(((streak?.current_streak || 0) / 21) * 100, 100),
    },
    {
      id: 'transformation',
      title: '90-day transformation',
      icon: '🦋',
      timeframe: 'mid' as const,
      domain: 'Life Design',
      progress: Math.min(((streak?.current_streak || 0) / 90) * 100, 100),
    },
    {
      id: 'identity',
      title: 'Become the person who always follows through',
      icon: '🏆',
      timeframe: 'long' as const,
      domain: 'Identity',
    },
  ];

  return (
    <DomainDashboard config={domainConfig}>
      {/* Streak Hero */}
      <StreakHero streak={streak} forgiveness={forgiveness} />

      {/* LAYER 1: Daily Actions */}
      <DailyActionsLayer
        actions={layer1Actions}
        onActionToggle={handleActionToggle}
      />

      {/* LAYER 2: Weekly Rhythm */}
      <WeeklyRhythmLayer rhythms={layer2Rhythms} />

      {/* LAYER 4: Long-Term Vision (collapsed by default) */}
      <LongTermVisionLayer goals={layer4Goals} defaultCollapsed={true} />

      {/* Motivational Quote */}
      <ZenFade delay={0.4}>
        <ZenCard className="text-center">
          <Sparkles size={24} className="text-[var(--gold-primary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-lg italic">
            "Discipline is the bridge between goals and accomplishment."
          </p>
          <p className="text-[var(--text-ghost)] text-sm mt-2">— Jim Rohn</p>
        </ZenCard>
      </ZenFade>

      {/* Manage Habits Link */}
      <div className="mt-8 text-center">
        <Link
          href="/dashboard/settings"
          className="text-[var(--text-muted)] hover:text-[var(--gold-primary)] text-sm transition-colors"
        >
          ⚙️ Manage your habits →
        </Link>
      </div>
    </DomainDashboard>
  );
}
