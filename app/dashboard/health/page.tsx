'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Droplets, 
  Moon, 
  Sun,
  Flame,
  Target,
  Trophy,
  Waves,
  Footprints,
  Heart,
  Utensils,
  ArrowRight
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, EmptyDomainState } from '@/components/dashboard/DomainDashboard';
import { ZenCard, ZenFade, ZenNumber } from '@/components/zen';
import { 
  DailyActionsLayer, 
  WeeklyRhythmLayer, 
  ActiveProgramsLayer, 
  LongTermVisionLayer 
} from '@/components/layers';
import { DailyLog, Workout } from '@/types/database';

const domainConfig = getDomainConfig('health');

interface HealthData {
  todayLog: DailyLog | null;
  recentWorkouts: Workout[];
  weeklyStats: {
    workoutsCompleted: number;
    avgWaterIntake: number;
    avgSleepHours: number;
    runsCompleted: number;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // State for daily actions (would connect to real data)
  const [dailyActions, setDailyActions] = useState({
    workout: false,
    water: false,
    sleep: false,
    freshFood: false,
    coldShower: false,
  });

  useEffect(() => {
    // Reset state on mount
    setLoading(true);
    setData(null);
    
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
          .maybeSingle();

        // Initialize daily actions from today's log
        if (todayLog) {
          setDailyActions({
            workout: todayLog.workout_type !== null && todayLog.workout_type !== 'Rest',
            water: (todayLog.water_intake_oz || 0) >= 64,
            sleep: (todayLog.sleep_hours || 0) >= 7,
            freshFood: false, // Would come from habits
            coldShower: todayLog.cold_shower || false,
          });
        }

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
          .select('water_intake_oz, sleep_hours, workout_type')
          .eq('user_id', user.id)
          .gte('log_date', weekAgo.toISOString().split('T')[0]);

        interface WeekLogEntry {
          water_intake_oz: number | null;
          sleep_hours: number | null;
          workout_type: string | null;
        }

        const gymWorkouts = weekLogs?.filter((l: WeekLogEntry) => l.workout_type && l.workout_type !== 'Rest').length || 0;
        const runs = weekLogs?.filter((l: WeekLogEntry) => l.workout_type === 'Run').length || 0;

        const weeklyStats = {
          workoutsCompleted: gymWorkouts,
          avgWaterIntake: weekLogs?.length
            ? Math.round(weekLogs.reduce((sum: number, log: WeekLogEntry) => sum + (log.water_intake_oz || 0), 0) / weekLogs.length)
            : 0,
          avgSleepHours: weekLogs?.length
            ? Number((weekLogs.reduce((sum: number, log: WeekLogEntry) => sum + (log.sleep_hours || 0), 0) / weekLogs.length).toFixed(1))
            : 0,
          runsCompleted: runs,
        };

        setData({
          todayLog,
          recentWorkouts: workouts || [],
          weeklyStats,
        });
      } catch (error) {
        console.error('Error fetching health data:', error);
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
          <div className="h-40 bg-[var(--surface-card)] rounded-[28px] mb-6" />
          <div className="h-60 bg-[var(--surface-card)] rounded-[28px] mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-[var(--surface-card)] rounded-[20px]" />
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

  const { weeklyStats } = data;

  // ============================================================================
  // LAYER 1: DAILY ACTIONS
  // "What do I do TODAY?"
  // ============================================================================
  const layer1Actions = [
    { 
      id: 'workout', 
      label: 'Workout today', 
      icon: <Dumbbell size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.workout 
    },
    { 
      id: 'water', 
      label: 'Drink 64oz+ water', 
      icon: <Droplets size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.water 
    },
    { 
      id: 'sleep', 
      label: '7+ hours sleep (last night)', 
      icon: <Moon size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.sleep 
    },
    { 
      id: 'freshFood', 
      label: 'Eat fresh / cook at home', 
      icon: <Utensils size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.freshFood 
    },
    { 
      id: 'coldShower', 
      label: 'Cold shower', 
      icon: <Waves size={18} className="text-[var(--text-muted)]" />,
      completed: dailyActions.coldShower 
    },
  ];

  // ============================================================================
  // LAYER 2: WEEKLY RHYTHM
  // "What am I building THIS WEEK?"
  // ============================================================================
  const layer2Rhythms = [
    { 
      id: 'gym', 
      label: 'Gym Workouts', 
      icon: '🏋️',
      current: weeklyStats.workoutsCompleted, 
      target: 4, 
      unit: 'sessions',
      frequency: '4x per week'
    },
    { 
      id: 'running', 
      label: 'Running', 
      icon: '🏃',
      current: weeklyStats.runsCompleted, 
      target: 2, 
      unit: 'sessions',
      frequency: '2x per week'
    },
    { 
      id: 'fasting', 
      label: 'Intermittent Fasting', 
      icon: '⏰',
      current: 0, // Would track from habits
      target: 1, 
      unit: 'day',
      frequency: 'Once per week'
    },
    { 
      id: 'alcohol', 
      label: 'Alcohol Limit', 
      icon: '🍺',
      current: 0, // Days this month with alcohol
      target: 2, 
      unit: 'max/month',
      frequency: 'Max 2x per month'
    },
  ];

  // ============================================================================
  // LAYER 3: ACTIVE PROGRAMS
  // "What am I learning/training over MONTHS?"
  // ============================================================================
  const layer3Programs = [
    {
      id: 'calisthenics',
      name: 'Calisthenics',
      icon: '🤸',
      category: 'Strength Training',
      startDate: 'Jan 2025',
      currentLevel: 'Beginner',
      nextMilestone: 'First muscle-up',
      progressPercent: 15,
    },
    {
      id: 'swimming',
      name: 'Swimming',
      icon: '🏊',
      category: 'Cardio & Endurance',
      startDate: 'Mar 2025',
      currentLevel: 'Learning',
      nextMilestone: '25m freestyle',
      progressPercent: 5,
    },
    {
      id: 'ninja',
      name: 'Ninja Training',
      icon: '🥷',
      category: 'Athletic Skills',
      startDate: 'TBD',
      currentLevel: 'Not Started',
      nextMilestone: 'Join classes',
      progressPercent: 0,
    },
  ];

  // ============================================================================
  // LAYER 4: LONG-TERM VISION
  // "Why am I doing all this?"
  // ============================================================================
  const layer4Goals = [
    {
      id: 'transformation',
      title: 'Complete body transformation',
      icon: '💪',
      timeframe: 'short' as const,
      domain: 'Physical Health',
      progress: 20,
    },
    {
      id: 'energy',
      title: 'Have consistent high energy',
      icon: '⚡',
      timeframe: 'short' as const,
      domain: 'Lifestyle',
    },
    {
      id: 'athleticism',
      title: 'Become truly athletic',
      icon: '🏆',
      timeframe: 'mid' as const,
      domain: 'Physical Performance',
      motivationalNote: 'Run, swim, climb, fight',
    },
    {
      id: 'longevity',
      title: 'Health for decades',
      icon: '🌿',
      timeframe: 'long' as const,
      domain: 'Life Quality',
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
        <ZenCard className="mb-8 p-6" variant="elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">
                This Week&apos;s Health
              </p>
              <div className="flex items-baseline gap-2">
                <ZenNumber 
                  value={weeklyStats.workoutsCompleted} 
                  className="text-5xl" 
                  gold={weeklyStats.workoutsCompleted >= 4}
                />
                <span className="text-[var(--text-muted)] text-lg">/ 4 workouts</span>
              </div>
              <p className="text-[var(--text-ghost)] text-sm mt-2">
                {weeklyStats.workoutsCompleted >= 4 
                  ? '🔥 Weekly goal hit!' 
                  : `${4 - weeklyStats.workoutsCompleted} more to hit your target`}
              </p>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-light text-[var(--text-primary)]">{weeklyStats.avgWaterIntake}oz</p>
                <p className="text-[var(--text-ghost)] text-xs">Avg water</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light text-[var(--text-primary)]">{weeklyStats.avgSleepHours}h</p>
                <p className="text-[var(--text-ghost)] text-xs">Avg sleep</p>
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
