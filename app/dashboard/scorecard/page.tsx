'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { WeeklyScorecard, DailyLog } from '@/types/database';

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

      // Get this week's data
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch daily logs for this week
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', startOfWeek.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (logs && logs.length > 0) {
        // Calculate weekly stats
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

      // Fetch past scorecards
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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📊 Weekly Scorecard</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            ← Back
          </Link>
        </div>

        {/* This Week's Stats */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">This Week</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">{weeklyStats.workouts}</p>
              <p className="text-sm text-gray-600">Workouts</p>
              <p className="text-xs text-gray-400">Target: 6</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{weeklyStats.disciplineDays}</p>
              <p className="text-sm text-gray-600">Discipline Days</p>
              <p className="text-xs text-gray-400">Target: 7</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{weeklyStats.leetcodeSolved}</p>
              <p className="text-sm text-gray-600">LeetCode</p>
              <p className="text-xs text-gray-400">Target: 15</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">{weeklyStats.pagesRead}</p>
              <p className="text-sm text-gray-600">Pages Read</p>
              <p className="text-xs text-gray-400">Target: 140</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{weeklyStats.averageScore}%</p>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-xs text-gray-400">Target: 80%</p>
            </div>
          </div>
        </div>

        {/* Weekly Targets */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Targets</h2>
          <div className="space-y-4">
            {[
              { label: 'Workouts', current: weeklyStats.workouts, target: 6 },
              { label: 'Discipline Days', current: weeklyStats.disciplineDays, target: 7 },
              { label: 'LeetCode Problems', current: weeklyStats.leetcodeSolved, target: 15 },
              { label: 'Pages Read', current: weeklyStats.pagesRead, target: 140 },
            ].map((item) => {
              const percentage = Math.min((item.current / item.target) * 100, 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span>{item.current} / {item.target}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        percentage >= 100 ? 'bg-green-500' : 
                        percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Past Scorecards */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Scorecards</h2>
          {scorecards.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Week</th>
                    <th className="text-center py-2">Fitness</th>
                    <th className="text-center py-2">Discipline</th>
                    <th className="text-center py-2">Skills</th>
                    <th className="text-center py-2">Finance</th>
                    <th className="text-center py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecards.map((card) => (
                    <tr key={card.id} className="border-b">
                      <td className="py-2">
                        {new Date(card.week_start).toLocaleDateString()} - {new Date(card.week_end).toLocaleDateString()}
                      </td>
                      <td className="text-center">{card.fitness_score}%</td>
                      <td className="text-center">{card.discipline_score}%</td>
                      <td className="text-center">{card.skills_score}%</td>
                      <td className="text-center">{card.finance_score}%</td>
                      <td className="text-center font-bold">{card.total_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No past scorecards yet. Complete a full week to generate your first scorecard!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
