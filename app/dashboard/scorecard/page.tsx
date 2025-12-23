'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Dumbbell, 
  Brain, 
  Code, 
  BookOpen,
  Calendar,
  Loader2,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { WeeklyScorecard, DailyLog } from '@/types/database';
import { ZenCard, ZenFade, ZenNumber, ZenProgress, ZenIcon } from '@/components/zen';

export default function ScorecardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scorecards, setScorecards] = useState<WeeklyScorecard[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    workouts: 0,
    disciplineDays: 0,
    leetcodeSolved: 0,
    pagesRead: 0,
    averageScore: 0,
  });

  useEffect(() => {
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', startOfWeek.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (logs && logs.length > 0) {
        const workouts = logs.filter((l: DailyLog) => l.workout_type && l.workout_type !== 'Rest').length;
        const disciplineDays = logs.filter((l: DailyLog) => 
          l.woke_up_at_6am && l.cold_shower && l.no_phone_first_hour && l.meditated && l.planned_tomorrow
        ).length;
        const leetcodeSolved = logs.reduce((sum: number, l: DailyLog) => sum + (l.leetcode_solved || 0), 0);
        const pagesRead = logs.reduce((sum: number, l: DailyLog) => sum + (l.pages_read || 0), 0);
        const averageScore = logs.reduce((sum: number, l: DailyLog) => sum + (l.discipline_score || 0), 0) / logs.length;

        setWeeklyStats({
          workouts,
          disciplineDays,
          leetcodeSolved,
          pagesRead,
          averageScore: Math.round(averageScore),
        });
      }

      const { data: cards } = await supabase
        .from('weekly_scorecards')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(10);

      if (cards) {
        setScorecards(cards);
      }
    } catch (error) {
      console.error('Error fetching scorecard:', error);
    } finally {
      setLoading(false);
    }
  };

  const isGold = weeklyStats.averageScore >= 90;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
      </div>
    );
  }

  const stats = [
    { 
      icon: Dumbbell, 
      label: 'Workouts', 
      value: weeklyStats.workouts, 
      target: 4,
      gold: weeklyStats.workouts >= 4 
    },
    { 
      icon: Brain, 
      label: 'Discipline Days', 
      value: weeklyStats.disciplineDays, 
      target: 7,
      gold: weeklyStats.disciplineDays >= 7 
    },
    { 
      icon: Code, 
      label: 'LeetCode', 
      value: weeklyStats.leetcodeSolved, 
      target: 10,
      gold: weeklyStats.leetcodeSolved >= 10 
    },
    { 
      icon: BookOpen, 
      label: 'Pages Read', 
      value: weeklyStats.pagesRead, 
      target: 70,
      gold: weeklyStats.pagesRead >= 70 
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <motion.div 
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">Back</span>
            </motion.div>
          </Link>
          <ZenIcon icon={TrendingUp} />
        </div>
      </motion.header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Title */}
        <ZenFade>
          <div className="mb-8">
            <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">
              Weekly Scorecard
            </h1>
            <p className="text-[var(--text-ghost)]">Track your weekly progress and achievements.</p>
          </div>
        </ZenFade>

        {/* Average Score */}
        <ZenFade delay={0.1}>
          <ZenCard variant={isGold ? 'gold' : 'default'} halo={isGold} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-2">
                  Average Discipline Score
                </p>
                <div className="flex items-baseline gap-2">
                  <ZenNumber value={weeklyStats.averageScore} gold={isGold} className="text-5xl" />
                  {isGold && (
                    <span className="text-[var(--gold-primary)] text-sm font-medium">Elite Week</span>
                  )}
                </div>
              </div>
              {isGold && (
                <div className="w-16 h-16 rounded-full bg-[var(--gold-soft)] flex items-center justify-center">
                  <Trophy size={32} className="text-[var(--gold-primary)]" strokeWidth={1} />
                </div>
              )}
            </div>
          </ZenCard>
        </ZenFade>

        {/* Weekly Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const progress = Math.min((stat.value / stat.target) * 100, 100);
            
            return (
              <ZenFade key={idx} delay={0.2 + idx * 0.1}>
                <ZenCard variant={stat.gold ? 'gold' : 'default'} halo={stat.gold}>
                  <div className="flex items-start justify-between mb-3">
                    <ZenIcon icon={Icon} gold={stat.gold} size={20} />
                    {stat.gold && (
                      <span className="text-[var(--gold-primary)] text-xs font-medium">✓ Goal</span>
                    )}
                  </div>
                  <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.05em] mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <ZenNumber value={stat.value} gold={stat.gold} className="text-2xl" />
                    <span className="text-[var(--text-ghost)] text-sm">/ {stat.target}</span>
                  </div>
                  <ZenProgress value={progress} gold={stat.gold} showPulse={false} />
                </ZenCard>
              </ZenFade>
            );
          })}
        </div>

        {/* Past Weeks */}
        <ZenFade delay={0.6}>
          <div>
            <h2 className="text-[var(--text-primary)] font-light text-lg tracking-wide mb-4">
              Past Weeks
            </h2>
            
            {scorecards.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="text-[var(--text-ghost)] mx-auto mb-4" strokeWidth={1} />
                <p className="text-[var(--text-muted)]">No past weeks yet</p>
                <p className="text-[var(--text-ghost)] text-sm">Keep logging to build your history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scorecards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    className="p-4 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                      <Calendar size={20} className="text-[var(--text-muted)]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)] font-medium">
                        Week of {new Date(card.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[var(--text-ghost)] text-sm">
                        Score: {card.total_score || 0}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-[var(--text-ghost)]" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ZenFade>
      </div>
    </div>
  );
}
